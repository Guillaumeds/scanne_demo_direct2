/* globals L:true */

L.Snap = {};

L.Snap.isDifferentLayer = function (marker, layer) {
    var i;
    var n;
    var markerId = L.stamp(marker);

    if (layer.hasOwnProperty('_snapIgnore')) {
        return false;
    }

    if (layer.hasOwnProperty('_topOwner') && marker.hasOwnProperty('_topOwner')) {
        return layer._topOwner !== marker._topOwner;
    }

    if (layer instanceof L.Marker) {
        return markerId !== L.stamp(layer);
    }

    if (layer.editing && layer.editing._enabled) {
        if (layer.editing._verticesHandlers) {
            var points = layer.editing._verticesHandlers[0]._markerGroup.getLayers();
            for(i = 0, n = points.length; i < n; i++) {
                if (L.stamp(points[i]) == markerId) {
                    return false;
                }
            }
        }

        else if (layer.editing._resizeMarkers) {
            for(i = 0; i < layer.editing._resizeMarkers.length; i++) {
                var resizeMarker = layer.editing._resizeMarkers[i];
                if (L.stamp(resizeMarker) == markerId) {
                    return false;
                }
            }

            if (layer.editing._moveMarker) {
                return markerId !== L.stamp(layer.editing._moveMarker);
            }

            return true;
        }
    }

    return true;
};
