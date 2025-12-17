/**
 * Logique principale du WebSIG Leaflet
 * Chargement des données, interactions, filtres
 */

// === VARIABLES GLOBALES ===
let map;
let loadedLayers = {};
let layerControls;

// === INITIALISATION DE LA CARTE ===
function initMap() {
  // Créer la carte
  map = L.map('map', {
    center: CONFIG.map.center,
    zoom: CONFIG.map.zoom,
    minZoom: CONFIG.map.minZoom,
    maxZoom: CONFIG.map.maxZoom,
    zoomControl: true
  });

  // Ajouter les fonds de carte
  const basemaps = {};
  for (const [key, config] of Object.entries(CONFIG.basemaps)) {
    basemaps[config.name] = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 19
    });
  }

  // Ajouter le premier fond par défaut
  basemaps[CONFIG.basemaps.osm.name].addTo(map);

  // Contrôle des couches
  layerControls = L.control.layers(basemaps, null, {
    collapsed: false,
    position: 'topright'
  }).addTo(map);

  // Échelle
  L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

  console.log('✅ Carte initialisée');
}

// === FONCTION DE GÉNÉRATION DES POPUPS ===
function createPopupContent(properties, layerName) {
  let html = `<div class="popup-content">`;
  html += `<h3>${layerName}</h3>`;
  html += `<table>`;

  // Afficher tous les attributs sauf ceux commençant par '_'
  for (const [key, value] of Object.entries(properties)) {
    if (!key.startsWith('_') && value !== null && value !== '') {
      // Formater les clés (remplacer _ par espaces, capitaliser)
      const label = key.replace(/_/g, ' ')
                       .replace(/\b\w/g, l => l.toUpperCase());
      
      // Formater les valeurs selon le type
      let displayValue = value;
      if (typeof value === 'number') {
        displayValue = value.toLocaleString('fr-FR');
      }
      
      html += `<tr><td><strong>${label}:</strong></td><td>${displayValue}</td></tr>`;
    }
  }

  html += `</table></div>`;
  return html;
}

// === FONCTION DE STYLE INTERACTIF ===
function onEachFeature(feature, layer, layerConfig) {
  // Popup
  if (feature.properties) {
    const popupContent = createPopupContent(feature.properties, layerConfig.name);
    layer.bindPopup(popupContent, CONFIG.popup);
  }

  // Survol
  layer.on({
    mouseover: function(e) {
      const layer = e.target;
      layer.setStyle({
        weight: 4,
        fillOpacity: 0.7
      });
      layer.bringToFront();
    },
    mouseout: function(e) {
      const layer = e.target;
      layer.setStyle(layerConfig.style);
    },
    click: function(e) {
      map.fitBounds(e.target.getBounds());
    }
  });
}

// === CHARGEMENT D'UNE COUCHE GEOJSON ===
function loadGeoJSONLayer(layerId, layerConfig) {
  console.log(`📥 Chargement de ${layerConfig.name}...`);

  // Ajouter cache buster si activé
  let url = layerConfig.url;
  if (CONFIG.cacheBuster) {
    const timestamp = new Date().getTime();
    url += `?v=${timestamp}`;
  }

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Créer la couche Leaflet
      const geojsonLayer = L.geoJSON(data, {
        style: layerConfig.style,
        onEachFeature: (feature, layer) => {
          onEachFeature(feature, layer, layerConfig);
        }
      });

      // Stocker la couche
      loadedLayers[layerId] = geojsonLayer;

      // Ajouter à la carte si visible par défaut
      if (layerConfig.visible) {
        geojsonLayer.addTo(map);
      }

      // Ajouter au contrôle des couches
      layerControls.addOverlay(geojsonLayer, layerConfig.name);

      console.log(`✅ ${layerConfig.name} chargé (${data.features.length} entités)`);

      // Zoomer sur l'étendue si c'est la première couche
      if (Object.keys(loadedLayers).length === 1) {
        map.fitBounds(geojsonLayer.getBounds());
      }
    })
    .catch(error => {
      console.error(`❌ Erreur de chargement de ${layerConfig.name}:`, error);
      alert(`Impossible de charger la couche ${layerConfig.name}`);
    });
}

// === CHARGEMENT DE TOUTES LES COUCHES ===
function loadAllLayers() {
  for (const [layerId, layerConfig] of Object.entries(CONFIG.dataLayers)) {
    loadGeoJSONLayer(layerId, layerConfig);
  }
}

// === FONCTION DE FILTRAGE ===
function filterLayer(layerId, attributeName, filterValue) {
  const layer = loadedLayers[layerId];
  if (!layer) return;

  layer.eachLayer(sublayer => {
    const value = sublayer.feature.properties[attributeName];
    
    if (filterValue === '' || value == filterValue) {
      sublayer.setStyle({ opacity: 1, fillOpacity: 0.3 });
    } else {
      sublayer.setStyle({ opacity: 0.1, fillOpacity: 0.05 });
    }
  });
}

// === RECHERCHE PAR ATTRIBUT ===
function searchFeature(layerId, attributeName, searchTerm) {
  const layer = loadedLayers[layerId];
  if (!layer) return;

  let found = false;

  layer.eachLayer(sublayer => {
    const value = String(sublayer.feature.properties[attributeName] || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    if (value.includes(search)) {
      sublayer.setStyle({ color: 'red', weight: 4 });
      if (!found) {
        map.fitBounds(sublayer.getBounds());
        sublayer.openPopup();
        found = true;
      }
    } else {
      sublayer.setStyle(CONFIG.dataLayers[layerId].style);
    }
  });

  if (!found) {
    alert('Aucun résultat trouvé');
  }
  }
// === EXPORT DES DONNÉES VISIBLES ===
function exportVisibleData(layerId, format = 'geojson') {
const layer = loadedLayers[layerId];
if (!layer) return;
const features = [];
layer.eachLayer(sublayer => {
features.push(sublayer.feature);
});
const geojson = {
type: 'FeatureCollection',
features: features
};
// Télécharger
const dataStr = JSON.stringify(geojson, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = ${layerId}_export.geojson;
link.click();
URL.revokeObjectURL(url);
}
// === INITIALISATION AU CHARGEMENT DE LA PAGE ===
document.addEventListener('DOMContentLoaded', function() {
console.log('🚀 Initialisation du WebSIG...');
initMap();
loadAllLayers();
});