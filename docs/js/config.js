/**
 * Configuration du WebSIG
 * Centralisez ici tous les paramètres de votre carte
 */

const CONFIG = {
  // === CARTE ===
  map: {
    center: [5.3600, -4.0083], // Abidjan (latitude, longitude)
    zoom: 12,
    minZoom: 10,
    maxZoom: 18
  },

  // === FONDS DE CARTE ===
  basemaps: {
    osm: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    },
    satellite: {
      name: 'Satellite (Esri)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri'
    },
    // Votre orthophoto interne (à adapter selon votre hébergement)
    orthophoto: {
      name: 'Orthophoto interne',
      url: 'https://votre-serveur.com/tiles/{z}/{x}/{y}.png', // À modifier
      attribution: '&copy; Votre organisation'
    }
  },

  // === COUCHES DE DONNÉES ===
  dataLayers: {
    lots: {
      name: 'Lots',
      url: '/data/processed/lots.geojson',
      style: {
        color: '#3388ff',
        weight: 2,
        fillOpacity: 0.3,
        fillColor: '#3388ff'
      },
      visible: true,
      attribution: 'nom_lot'
    },
    ilots: {
      name: 'Îlots',
      url: '/data/processed/ilots.geojson',
      style: {
        color: '#ff7800',
        weight: 2,
        fillOpacity: 0.2,
        fillColor: '#ff7800'
      },
      visible: true,
      attribution: 'nom_ilot'
    },
    polygonale: {
      name: 'Polygonale',
      url: '/data/processed/polygonale.geojson',
      style: {
        color: '#00ff00',
        weight: 3,
        fillOpacity: 0.1,
        fillColor: '#00ff00'
      },
      visible: false,
      attribution: 'reference'
    }
  },

  // === POPUP ===
  popup: {
    maxWidth: 300,
    className: 'custom-popup'
  },

  // === GESTION DU CACHE ===
  // Ajouter un timestamp pour forcer le rechargement
  cacheBuster: true
};