import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { MapView } from 'expo';
import { Marker } from 'react-native-maps';
import ClusteredMapView from 'react-native-maps-super-cluster'

import flagImages from './assets/flagImages'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

// this is the icon we use if we don't know the player's pic
let noBlueIDicon = require("./assets/playericons/blueNoPlayerIcon.png");
let noYellowIDicon = require("./assets/playericons/yellowNoPlayerIcon.png");

const MARKER_SIZE = 25
const CLUSTER_MAX_SIZE = 30


// custom coponents for the app
import blueImages from "./assets/blueIndex";
import yellowImages from "./assets/yellowIndex";
import profilePic from "./assets/profilePic";

import nationality from "./assets/nationality";
// import amenities from "./amenities.js";

//
// bring in the golf course
var golfCourse = require("./Pinnicle.json")
var playerDrawingUtils = require('./PlayerDrawingUtils.js')
// 
// start over some point (I think this is Rogers, Az)
var initialRegion = {
  latitude: 36.296168,
  longitude: -94.198221,
  latitudeDelta: 0.00922,
  longitudeDelta: 0.00421
}


class ShowMap extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      region: initialRegion,
      golfCourse: golfCourse,
      mapType: 'satellite',
      store: null,
    }
    // console.log("ShowMap props->", golfCourse)
  }

  //
  // setupPlayer2Draw manages the id for the selected player,
  // it also gets info for the hole, and icon
  //
  // PROTECT against the backend providing bogus information as best we can
  setupPlayer2Draw = plyr => {
    let playerInfo = {};


    let cHole = -1;
    // console.log("z->", pt, this.state.store[pt])
    if (plyr.Hole != undefined) {
      cHole = plyr.Hole - 1;
    }
    if (cHole === -1) {
      cHole = 0;
    } else if (cHole < 0 || cHole > 17) {
      cHole = 0;
    }
    playerInfo.Hole = cHole;

    let icon = null;
    if (
      this.state.oldSelectedPlayer === null ||
      plyr.ID != this.state.oldSelectedPlayer
    ) {
      if (!(plyr.ID in blueImages)) {
        icon = noBlueIDicon;
      } else {
        icon = blueImages[plyr.ID];
      }
    } else if (plyr.ID === this.state.oldSelectedPlayer) {
      if (!(this.state.oldSelectedPlayer in yellowImages)) {
        icon = noYellowIDicon; // should be yellow!!
      } else {
        icon = yellowImages[plyr.ID];
      }
    }
    playerInfo.icon = icon;

    playerInfo.nationality = nationality[plyr.ID];
    return playerInfo;
  };

  // now that the map is fully init'ed set initial region to view
  handleMapReady= () => {
    this.setState({region: this.props.region})
    
    // console.log("map is ready")
  }

  // part of cluster map: style the cluster view and enable tapping
  renderCluster = (cluster, onPress) => {
    return (
      <Marker
          key={`g_${cluster.clusterId}`}
          identifier={`g_${cluster.clusterId}`}
          coordinate={cluster.coordinate}
          onPress={onPress}>
         <View style={styles.cluster}>
          <Text style={styles.clusterText}>
            {cluster.pointCount}
          </Text>
        </View>

      </Marker>
    )
  }


  // part of cluster map: style the individual markers
  renderMarker = (markerData) => (
    <Marker
      key={`c_${markerData.ID}`}
      identifier={`c_${markerData.identifier}`}
      image={markerData.icon}
      anchor={{x: 0.5, y: 1}}
      centerOffset={{x: 0.5, y: 1}}
      coordinate={markerData.location}>
    </Marker>
  )

  // 
  // gather the markers to draw
  render = () => {
    playerDrawingUtils.mapLocationClear();
    // 1 loading
    if (this.props.zData && this.props.zData.loading) {
      return <Text style={{marginTop:60}}>Loading</Text>
    }
  
    // 2 error
    if (this.props.zData && this.props.zData.error) {
      console.log("error-->", this.props.zData.error)
      return <Text style={{marginTop: 30}}>Error</Text>
    
    } else {
      let markers = []
      {
        this.props.zData.playersU.forEach(p => {
          
          let plyr = JSON.parse(JSON.stringify(p)) 
          let playerInfo = this.setupPlayer2Draw(plyr)
          plyr.icon = playerInfo.icon
          plyr.identifier = plyr.ID + '-' + plyr.FirstName + '-' + plyr.LastName
          
          plyr.location = playerDrawingUtils.mapLocationOnHole(0, playerInfo.Hole, plyr, golfCourse);
          //  = {}
          plyr.location = JSON.parse(JSON.stringify(plyr.location))
          console.log("plyr->", plyr, plyr.FirstName, plyr.LastName)

          // plyr.location.longitude = b.longitude
          // console.log("g->", plyr)
          markers.push(plyr)

        })
        console.log("markers length->", markers)
      }
      return (
        <ClusteredMapView
          style={styles.map}
          clusteringEnabled={true}
          initialRegion={initialRegion}
          data={markers}
          radius={15}
          mapType={'satellite'}
          ref={(r) => { this.map = r }}
          renderCluster={this.renderCluster}
          renderMarker={this.renderMarker}/>
      )
    }
  }
}

//
// This is the graphql magic
// 
// This sets up the query for data.  It uses ggl - NOTE the back quotes
const JAM_QUERY = gql`
  # 2
  query {
      playersU {
          FirstName
          LastName
          Hole
          HoleLocation
          ID
      }
  }
`

// 3
// wrap the ShowMap component and make it a HOC.  The 'JAM_Query' can be anything you
// want, just be consistent with how you named the query. The 'zData' item is how
// the data will show up in the ShowMap component
export default graphql(JAM_QUERY, { name: 'zData' }) (ShowMap)



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    backgroundColor: '#3a2ae9',
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 1,
    borderColor: 'white',
  },
  cluster: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    backgroundColor: 'green',
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 1,
    borderColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clusterText: {
    fontSize: 10,
    color: 'white',
  },
})
