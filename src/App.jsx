import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'; // eslint-disable-line
import { Threebox } from 'threebox-plugin'
import "threebox-plugin/dist/threebox.css"

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwc2FpIiwiYSI6ImNsbTJ5MmZvajB6N3AzZXA5cmIyMzV3YWoifQ.aBMiWfn5mRYjylCNUxISJQ';


export default function App() {

  const [scale, setscale] = useState(1);
  const [selectModel, setselectModel] = useState(null);


  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once

      const origin = [-122.47920912, 37.716351775];
      map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: origin,
      zoom: zoom,
      pitch: 64.9,
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
              obj: "/soldier.glb",
              type: "gltf",
              scale: 20,
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

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}