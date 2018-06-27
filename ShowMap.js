import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { MapView } from 'expo';
import { Marker } from 'react-native-maps';

import flagImages from './assets/flagImages'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

// this is the icon we use if we don't know the player's pic
let noBlueIDicon = require("./assets/playericons/blueNoPlayerIcon.png");
let noYellowIDicon = require("./assets/playericons/yellowNoPlayerIcon.png");


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
  setupPlayer2Draw = plyr => {
    let pi = {};
    pi.type = "plyr";
    pi.ID = plyr.ID;

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
    pi.Hole = cHole;

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
    pi.icon = icon;

    pi.nationality = nationality[plyr.ID];
    return pi;
  };

  handleMapReady= () => {
    this.setState({region: this.props.region})
    
    console.log("map is ready")
  }

  render = () => {
    playerDrawingUtils.mapLocationClear();
    // 1 loading
    if (this.props.zData && this.props.zData.loading) {
      return <Text style={{marginTop:60}}>Loading</Text>
    }
  
    // 2 error
    if (this.props.zData && this.props.zData.error) {
      return <Text style={{marginTop: 30}}>Error</Text>
    
    } else {

      return (
        <MapView
          style={{ flex: 1 }}
          provider={null}
          region={this.state.region}
          mapType={this.state.mapType}
          onMapReady={() => {this.handleMapReady()}}
        >
          {
            Object.keys(flagImages).map((f, index) => {
              console.log("f->", flagImages[f])
              return (
                <Marker
                  key={index + 80}
                  coordinate={golfCourse.Features[index].properties.FlagLocation}
                  image={flagImages[f]}
                >
                  
                </Marker>
              )
            })
          }
          {
            this.props.zData.players.map(p => {
              console.log("g->", p)
              let pi = this.setupPlayer2Draw(p)
              console.log("g->", pi, p)
              let b = playerDrawingUtils.mapLocationOnHole(0, pi.Hole, p, golfCourse);
              return (
                <Marker 
                  key={p.ID}
                  image={pi.icon}
                  coordinate={b}
                />
              )
            })
          }
          
        </MapView>
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
      players {
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

