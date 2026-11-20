import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";
import { COLORS } from "../../constants/colors";
import { LocationCoordinate } from "../../types/location";

interface LocationMapProps {
  coordinate: LocationCoordinate;
  accuracy: number | null;
}

export function LocationMap({ coordinate, accuracy }: LocationMapProps) {
  const region: Region = {
    ...coordinate,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webFallback, styles.container]}>
        <Text style={styles.caption}>
          Peta tersedia pada aplikasi Android dan iOS.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        showsCompass
        showsScale
        toolbarEnabled
      >
        <Marker
          coordinate={coordinate}
          title="Lokasi barang"
          description="Perkiraan lokasi penjual"
        />
        <Circle
          center={coordinate}
          radius={500}
          strokeColor="rgba(46, 125, 91, 0.75)"
          fillColor="rgba(46, 125, 91, 0.12)"
        />
      </MapView>
      <Text style={styles.caption}>
        Area perkiraan 500 m
        {accuracy !== null ? ` • Akurasi GPS ±${Math.round(accuracy)} m` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  webFallback: {
    minHeight: 60,
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#F1F5F2",
    borderRadius: 10,
  },
  map: { width: "100%", height: 210, borderRadius: 10 },
  caption: { color: COLORS.mutedText, fontSize: 11.5 },
});
