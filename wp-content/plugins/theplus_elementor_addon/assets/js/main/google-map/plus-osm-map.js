/** OSM Option*/
function tp_map_osm(OSM_class) {
    /* =========== OSM Map ============== */
    if( OSM_class.length > 0 ){
        let Leaflet = L.noConflict();

        let CopyRight = { attribution : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' };		
        let grayscale = L.tileLayer( "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", CopyRight ),
            OsmDE = L.tileLayer( "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png", CopyRight ),
            OsmCH = L.tileLayer( "https://tile.osm.ch/switzerland/{z}/{x}/{y}.png", CopyRight ),
            OsmFr = L.tileLayer( "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", CopyRight ),
            OsmFrHot = L.tileLayer( "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", CopyRight );

        var OSM_Data = {
            'RemovePoint' : Array(),
            'OSM_Mark' : Array(),
            'OSM_PointName' : {},
            'OSM_JSOnCode' : Array(),
            'OSM_Polyline' : {},
        }

        let Dataval = (OSM_class[0] && OSM_class[0].dataset && OSM_class[0].dataset.osmmapdata) ? JSON.parse(OSM_class[0].dataset.osmmapdata)  : [],
            WidgetId = (Dataval && Dataval.widgetId) ? Dataval.widgetId : '',
            MapView = (Dataval && Dataval.MapView) ? Dataval.MapView.split(',') : '22.6,86.0'.split(','),
            OSM_ZoomLevel = (Dataval && Number(Dataval.OSM_ZoomLevel)) ? Number(Dataval.OSM_ZoomLevel) : Number(1),
            OSM_collapsed = (Dataval && Dataval.OSM_collapsed) ? 1 : 0,
            OSM_control = (Dataval && Dataval.OSM_control) ? Dataval.OSM_control : [],
            OSM_PolylineCr = (Dataval && Dataval.OSM_PolylineCr) ? Dataval.OSM_PolylineCr : '#000000',
            RepeaterData = (Dataval && Dataval.OSM_repeater) ? Dataval.OSM_repeater : [],
            OSM_Def_TileLayer = (Dataval && Dataval.OSM_Def_TileLayer) ? Dataval.OSM_Def_TileLayer : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

            if ( L.DomUtil.get(WidgetId) !== undefined && L.DomUtil.get(WidgetId) ) {
                L.DomUtil.get(WidgetId)._leaflet_id = null;
            }

            if( RepeaterData.length > 0 ){
                RepeaterData.forEach(function(item, idx) {
                    let OSM_Temp='',
                        OSM_PointType = (item && item.OSM_PointType) ? item.OSM_PointType : '',
                        OSM_PopupType = (item && item.OSM_PopupType) ? item.OSM_PopupType : '',
                        OSM_latitude = (item && item.OSM_latitude) ? item.OSM_latitude.split(",") : '',
                        OSM_Name = (item && item.OSM_Name) ? item.OSM_Name : '',
                        OSM_Massage = (item && item.OSM_Massage) ? item.OSM_Massage : '',
                        OSM_MarkON = (item && item.OSM_MarkON) ? item.OSM_MarkON : '',
                        OSM_IconSize = (item && item.Osm_iconSize) ? item.Osm_iconSize.split(",") : [22, 22],
                        OSM_PTAnchor = (item && item.Osm_PTAnchor) ? item.Osm_PTAnchor.split(",") : [0, 0],
                        OSM_Polyline = (item && item.Osm_Polyline) ? 1 : 0,
                        OSM_PolylineCon = (item && item.Osm_PolylineCon) ? item.Osm_PolylineCon : 'one';

                    let PTAnchor = OSM_PTAnchor.map(function (x) { return parseInt(x); });
                    let MyIcon = L.icon({ iconUrl: item.OSM_ImgSelect, 
                                            popupAnchor: PTAnchor, 
                                            tooltipAnchor: PTAnchor, 
                                            iconSize: OSM_IconSize 
                                        });

                    if( OSM_PointType == "marker" ){
                        let Properties = {closeOnClick: false, autoClose: false, closeOnEscapeKey: false, icon: MyIcon };
                        if( OSM_PopupType == "popup" ){
                            OSM_Temp = L.marker( OSM_latitude, Properties ).bindPopup( OSM_Massage )
                        }else if( OSM_PopupType == "tooltip" ){
                            OSM_Temp = L.marker( OSM_latitude, { draggable: true, icon : MyIcon } ).bindTooltip( OSM_Massage )
                        } else {
                            OSM_Temp = L.marker( OSM_latitude, { draggable: true, icon : MyIcon } )
                        }
                    }else if( OSM_PointType == "circle" ){
                        let OSM_circle = {color: 'red', fillColor: '#f03', fillOpacity: 0.5, radius: 500, className: 'tp-osm-circle' },
                            L_Circle = L.circle( OSM_latitude, { OSM_circle } );
                        if( OSM_PopupType == "popup" ){
                            OSM_Temp = L_Circle.bindPopup( OSM_Massage )
                        }else if( OSM_PopupType == "tooltip" ){
                            OSM_Temp = L_Circle.bindTooltip( OSM_Massage )
                        }else{
                            OSM_Temp = L_Circle
                        }
                    }else if( OSM_PointType == "geoJSON" ){
                        let geoJSON = '',
                            JsonCode = (item && item.OSM_GeoJsonCode) ? JSON.parse(item.OSM_GeoJsonCode) : '';
                        if( OSM_PopupType == "popup" ){
                            geoJSON = L.geoJSON( JsonCode, {
                                            onEachFeature: function (feature, layer) { 
                                                layer.bindPopup(feature.properties.name); 
                                            },
                                        } )
                        }else if( OSM_PopupType == "tooltip" ){
                            geoJSON = L.geoJSON( JsonCode, {
                                onEachFeature: function (feature, layer) { 
                                    layer.bindTooltip(feature.properties.name); 
                                },
                            } )
                        }else{
                            geoJSON = L.geoJSON( JsonCode, {
                                onEachFeature: function (feature, layer) { 
                                    layer; 
                                },
                            } )
                        }
                            OSM_Data.OSM_JSOnCode.push( geoJSON );
                    }

                    if( OSM_PointType == "marker" || OSM_PointType == "circle" ){
                        if(OSM_Polyline){
                            if(OSM_Data.OSM_Polyline && OSM_Data.OSM_Polyline[OSM_PolylineCon] == undefined){
                                OSM_Data.OSM_Polyline[OSM_PolylineCon] = [];
                            }

                            OSM_Data.OSM_Polyline[OSM_PolylineCon].push(OSM_latitude);
                        }

                        OSM_Data.OSM_Mark.push( OSM_Temp );
                        OSM_Data.OSM_PointName[OSM_Name] = OSM_Temp;

                        if(OSM_MarkON == 0){ 
                            OSM_Data.RemovePoint.push( OSM_Temp );
                        }
                    }
                });
            }
            
        let cities = L.layerGroup( OSM_Data.OSM_Mark );
        let MapOptions = {
                center : MapView,
                zoom : OSM_ZoomLevel,
                closePopupOnClick: false,
                attributionControl : true,
                layers: [ L.tileLayer( OSM_Def_TileLayer, CopyRight ), cities]
            };

            if( ! OSM_control.includes("zoomControl") ) {
                MapOptions.zoomControl = false;
            }
            if( ! OSM_control.includes("scrollWheelZoom") ) {
                MapOptions.scrollWheelZoom = false;
            }
            if( ! OSM_control.includes("doubleClickZoom") ) {
                MapOptions.doubleClickZoom = false;
            }
            if( ! OSM_control.includes("mapdragging") ) {
                MapOptions.dragging = false;
            }

        let map = L.map(WidgetId, MapOptions);

        let baseMaps = {
            "OSM": grayscale,
            "OSM.de": OsmDE,
            "OSM.ch" : OsmCH,
            "OSM.Fr" : OsmFr,
            "OSM.Fr" : OsmFrHot,
        };
        L.control.layers( baseMaps, OSM_Data.OSM_PointName, {collapsed : OSM_collapsed} ).addTo(map);

        /* =========== Scale Enable ============ */
        if( OSM_control.includes("Scalecontrol") ) {
            L.control.scale({ maxWidth: 100, imperial: true, metric: true }).addTo(map);
        }

        /* =========== OSM Polyline For Map ========== */
        if(OSM_Data && OSM_Data.OSM_Polyline){
            Object.entries(OSM_Data.OSM_Polyline).forEach(function(item, idx) {
                L.polyline( item[1], {color: OSM_PolylineCr} ).addTo(map);
            });
        }

        /* =========== Remove Point For Map ========== */
        if(OSM_Data && OSM_Data.RemovePoint.length > 0){
            OSM_Data.RemovePoint.forEach(function(item, idx) {
                map.removeLayer(item);
            });
        }
        
        /* =========== Add GeoJson Code ============== */
        if(OSM_Data && OSM_Data.OSM_JSOnCode.length > 0){
            OSM_Data.OSM_JSOnCode.forEach(function(item, idx) {
                item.addTo(map);	
            });
        }	

    }
}

