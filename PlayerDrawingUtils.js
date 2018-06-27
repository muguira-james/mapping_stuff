//
/*
The routines here are used to place players

The code will place a plyer on a 6 sided template

The top left player is number 1
The top right player is number 2
The middle left player is number 3
The middle right player is number 4
The lower left player is number 5
The lower right player is number 6

OR

The code can use a vertical or horizontal line to place players.

functions
createLayLng is an internal function used to produce a javascript Object
boxCalc is also internal, it adjusts the center point {lat, lng} with a small offset
vline is also internal, it places players along a vertical Line
hline is also internal, it places players along a horizontal line

mapLocationClear clears the holeMapIndex
mapLocationOnHole places the given player around a center
computeZoomOffSet uses the current zoom to create a small number to use as an offset


*/

// createLatLng - internal to this file, returns a {lat, lng}
createLatLng = function(lat, lng) {
  var p2 = "{ \"latitude\": " + lat + ", \"longitude\": " + lng + "}"
  return JSON.parse(p2);
}

//
// 18 holes on a golfcourse
var holeMapIndex = [18];

//
// resets the hole map index back to zero (0)
exports.mapLocationClear = function() {
  for (i=0; i<18; i++) {
    holeMapIndex[i] = {};
    holeMapIndex[i].tee = 0
    holeMapIndex[i].fairway = 0
    holeMapIndex[i].green = 0
  }
}

//
// given a zoomOffSet, a hole number (0-17), a player, and a golfCourse configuration
// compute and place the player on the 6 sided template
//
// limitations:
// 1. the center point for placing a player is the same as the physical location.  For
// example, this code places the players around the flag on the green.  Some times
// you want to place the player slightly away from the flag to improve the display
//
// solution
// create 3 more properties of the golfcourse configuration, teeTemplateCenter,
// fairwayTemplateCenter and GreenTemplateCenter
exports.mapLocationOnHole = function(zoomOffSet, hole, plyr, golfCourse) {
  let latlng = {};
  // let hole = Hole - 1

  console.log("mloh: hole->", hole, zoomOffSet, plyr, holeMapIndex[hole]);
  if (plyr.HoleLocation === "TEE") {

    // 1st, create the center point for the template
    console.log("t->", golfCourse.Features[hole].properties.teeTemplateCenter, holeMapIndex[hole].tee)
    latlng.latitude = golfCourse.Features[hole].properties.teeTemplateCenter[holeMapIndex[hole].tee].latitude
    latlng.longitude = golfCourse.Features[hole].properties.teeTemplateCenter[holeMapIndex[hole].tee].longitude
    
    // once you've put somebody in a template slot make the next available
    holeMapIndex[hole].tee += 1
    if (holeMapIndex[hole].tee > 5) {
      holeMapIndex[hole].tee = 0
    }

  } else if ((plyr.HoleLocation === "FWY") || (plyr.HoleLocation === "FWY2")) {
    // center point for the fairway
    // console.log("f->", golfCourse.Features[hole].properties.fairwayTemplateCenter[holeMapIndex[hole].tee])
    latlng.latitude = golfCourse.Features[hole].properties.fairwayTemplateCenter[holeMapIndex[hole].fairway].latitude
    latlng.longitude = golfCourse.Features[hole].properties.fairwayTemplateCenter[holeMapIndex[hole].fairway].longitude


    // keep incrementing through the fairway template
    holeMapIndex[hole].fairway += 1
    if (holeMapIndex[hole].fairway > 5) {
      holeMapIndex[hole].fairway = 0
    }
  } else if (plyr.HoleLocation === "GRN") {
    // center point for the green
    // console.log("g->", golfCourse.Features[hole].properties.greenTemplateCenter[holeMapIndex[hole].tee])
    latlng.latitude = golfCourse.Features[hole].properties.greenTemplateCenter[holeMapIndex[hole].green].latitude
    latlng.longitude = golfCourse.Features[hole].properties.greenTemplateCenter[holeMapIndex[hole].green].longitude
   
    holeMapIndex[hole].green += 1
    if (holeMapIndex[hole].green > 5) {
      holeMapIndex[hole].green = 0
    }
  } else {
    console.log("Error: mapLocationOnHole: holeLocation is not in { tee, fairway, green }", plyr.HoleLocation)
    latlng.coordinate.latitude = 0.0;
    latlng.coordinate.longitude = 0.0;
    
  }

  // return the final location for a given player
  // console.log("play draw-->", latlng)
  return latlng;
}

 //
// setupPlayer2Draw manages the id for the selected player,
// it also gets info for the hole, and icon
exports.setupPlayerHole2Draw = function(plyr) {
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

  return cHole
}
