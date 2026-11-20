import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { LocationCoordinate } from "../../types/location";

interface LocationMapProps {
  coordinate: LocationCoordinate;
  accuracy: number | null;
}

export function LocationMap({ coordinate, accuracy }: LocationMapProps) {
  const { latitude, longitude } = coordinate;

  const padding = 0.01;

  const bbox = [
    longitude - padding,
    latitude - padding,
    longitude + padding,
    latitude + padding,
  ].join(",");

  const mapUrl =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  const openMapUrl =
    `https://www.openstreetmap.org/` +
    `?mlat=${latitude}&mlon=${longitude}` +
    `#map=16/${latitude}/${longitude}`;

  return (
    <View style={styles.container}>
      <View style={styles.mapFrame}>
        {React.createElement("iframe" as any, {
          title: "Peta lokasi barang",
          src: mapUrl,
          width: "100%",
          height: "100%",
          style: {
            border: 0,
            display: "block",
          },
          loading: "lazy",
        })}
      </View>

      <Text style={styles.caption}>
        Area perkiraan 500 m
        {accuracy !== null ? ` • Akurasi GPS ±${Math.round(accuracy)} m` : ""}
      </Text>

      <Pressable
        onPress={() => Linking.openURL(openMapUrl)}
        style={styles.openMapButton}
      >
        <Text style={styles.openMapText}>Buka peta lebih besar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  mapFrame: {
    width: "100%",
    height: 230,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#F1F5F2",
  },
  caption: {
    color: COLORS.mutedText,
    fontSize: 11.5,
  },
  openMapButton: {
    alignSelf: "flex-start",
    paddingVertical: 5,
  },
  openMapText: {
    color: COLORS.primaryGreen,
    fontSize: 12,
    fontWeight: "600",
  },
});
