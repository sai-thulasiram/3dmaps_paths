import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'; // eslint-disable-line
import { Threebox } from 'threebox-plugin'
import "threebox-plugin/dist/threebox.css"
import Stats from './stats.js';


mapboxgl.accessToken = 'pk.eyJ1IjoibWFwc2FpIiwiYSI6ImNsbTJ5MmZvajB6N3AzZXA5cmIyMzV3YWoifQ.aBMiWfn5mRYjylCNUxISJQ';


export default function App() {

  const [scale, setscale] = useState(1);
  const [selectModel, setselectModel] = useState(null);


  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(13);

  function drawLines() {
    var lines = new Array();
		var arcSegments = 25;
		var lineQuantity = 50;

		for (var i = 0; i < lineQuantity; i++){

			var line = new Array();
			var destination = [300*(Math.random()-0.5), 140*(Math.random()-0.5)];
			var maxElevation = Math.pow(Math.abs(destination[0]*destination[1]), 0.5) * 80000;

			var increment = destination.map(function(direction){
				return direction/arcSegments;
			})

			for (var l = 0; l<=arcSegments; l++){
				var waypoint = increment.map(function(direction){
					return direction * l
				})

				var waypointElevation = Math.sin(Math.PI*l/arcSegments) * maxElevation;

				waypoint.push(waypointElevation);
				line.push(waypoint);
			}

			lines.push(line)
		}

    return lines;

  }

  function animate(stats) {
    requestAnimationFrame(animate);
    stats.update();
  }

  function plotLines(e) {

      var lines = drawLines();
    // stats
			var stats = new Stats();
			mapContainer.current.appendChild(stats.dom);
			// animate(stats);

			e.target.addLayer({
				id: 'custom_layer1',
				type: 'custom',
				renderingMode: '3d',
				onAdd: function(map, mbxContext){

					// instantiate threebox
					window.tb = new Threebox(
						map, 
						mbxContext,
						{defaultLights: true}
					);

					for (let line of lines) {
						var lineOptions = {
							geometry: line,
							color: (line[1][1]/180) * 0xffffff, // color based on latitude of endpoint
							width: Math.random() + 1 // random width between 1 and 2
						}

						let lineMesh = window.tb.line(lineOptions);

						window.tb.add(lineMesh)
					}

				},
				
				render: function(gl, metric){
          window.tb.update();
				}
			});
  }

  useEffect(() => {
    if (map.current) return; // initialize map only once

      const origin = [ 75.3412,33.2778];
      map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: origin,
      zoom: zoom,
      pitch: 75,
      bearing: 172.5,
      antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });

      map.current.on("style.load", (e) => {
        const onObjectMouseOver = (e) => {
          // console.log("onObjectMouseOver");
        };
  
        const onSelectedChange = (e) => {
          const selected = e.detail.selected;
          if (selected) {
            setselectModel(e.detail);
          } else {
            setselectModel(null);
          }
        };
  
        const customLayer = {
          id: "custom_layer",
          type: "custom",
          renderingMode: "3d",
          onAdd: (m, gl) => {
            window.tb = new Threebox(m, gl, {
              defaultLights: true,
              // enableSelectingFeatures: true,
              enableSelectingObjects: true,
              enableDraggingObjects: true,
              enableRotatingObjects: true
              // enableTooltips: true,
            });
            const options = {
              obj: "/radar.glb",
              type: "gltf",
              scale: 60,
              units: "meters",
              rotation: { x: 90, y: 0, z: 0 },
              anchor: "center" //default rotation
            };
            window.tb.loadObj(options, (model) => {
              const soldier = model.setCoords(origin);
              soldier.fixedZoom = scale;
              // Listening to the events
              soldier.addEventListener("SelectedChange", onSelectedChange, false);
              // soldier.addEventListener('Wireframed', onWireframed, false);
              // soldier.addEventListener('IsPlayingChanged', onIsPlayingChanged, false);
              // soldier.addEventListener('ObjectDragged', onDraggedObject, false);
              soldier.addEventListener(
                "ObjectMouseOver",
                onObjectMouseOver,
                false
              );
              // soldier.addEventListener('ObjectMouseOut', onObjectMouseOut, false);
              // soldier.addEventListener('ObjectChanged', onObjectChanged, false);
  
              window.tb.add(soldier, "soldier");
            });
          },
          render: (gl, metric) => {
            window.tb.update();
          }
        };
        e.target.addLayer(customLayer);

        plotLines(e);
      });
      map.current.on("load", (e) => {
        console.log(e);
      });
      return () => {

        console.log('Inside return value');
        map.current.remove();
      };
  });

  const onChangeScale = (e) => {
    const newScale = Number(e.target.value);
    if (selectModel) {
      const modelInTbIndex = window.tb.world.children.findIndex(
        (model) => model.uuid === selectModel.uuid
      );
      window.tb.world.children[modelInTbIndex].fixedZoom = 10;
      window.tb.world.children[modelInTbIndex].setObjectScale(newScale);
      window.tb.map.repaint = true;
      // window.tb.world.children[modelInTbIndex]._setObject({
      //   scale: newScale
      // });
      setscale(newScale);
    }
  };

  function drawLines() {
    var lines = new Array();
		var arcSegments = 25;
		var lineQuantity = 50;

		for (var i = 0; i < lineQuantity; i++){

			var line = new Array();
			var destination = [300*(Math.random()-0.5), 140*(Math.random()-0.5)];
			var maxElevation = Math.pow(Math.abs(destination[0]*destination[1]), 0.5) * 80000;

			var increment = destination.map(function(direction){
				return direction/arcSegments;
			})

			for (var l = 0; l<=arcSegments; l++){
				var waypoint = increment.map(function(direction){
					return direction * l
				})

				var waypointElevation = Math.sin(Math.PI*l/arcSegments) * maxElevation;

				waypoint.push(waypointElevation);
				line.push(waypoint);
			}

			lines.push(line)
		}

    return lines;

  }

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}