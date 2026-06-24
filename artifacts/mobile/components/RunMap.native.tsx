import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import type { RoutePoint } from "@/context/ActivityContext";

interface RunMapProps {
  mapRef: React.RefObject<MapView | null>;
  currentLocation: RoutePoint | null;
  route: RoutePoint[];
  actColor: string;
}

export default function RunMap({ mapRef, currentLocation, route, actColor }: RunMapProps) {
  if (!currentLocation) return null;

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_DEFAULT}
      initialRegion={{
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      mapType="standard"
      showsUserLocation={false}
      showsMyLocationButton={false}
    >
      {route.length > 1 && (
        <Polyline coordinates={route} strokeColor={actColor} strokeWidth={5} />
      )}
      <Marker coordinate={currentLocation}>
        <View style={[styles.markerDot, { backgroundColor: actColor }]}>
          <View style={styles.markerInner} />
        </View>
      </Marker>
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, width: "100%" },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  markerInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
});
