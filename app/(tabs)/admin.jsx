import { auth } from "@/firebase-config";
import { Stack, router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, onValue, ref, remove } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function AdminScreen() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        // No user is signed in.
        router.replace("/sign-in");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, "bookings");
    onValue(bookingsRef, snapshot => {
      const data = snapshot.val();
      setBookings(data ? Object.entries(data) : []);
    });
  }, []);

  const deleteBooking = async eventId => {
    const db = getDatabase();
    await remove(ref(db, `bookings/${eventId}`));
    Alert.alert("Booking deleted");
  };

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => <Button title="Sign Out" onPress={handleSignOut} />
        }}
      />
      <Text style={styles.title}>Admin Panel</Text>
      {bookings.map(([eventId, booking]) => (
        <View key={eventId} style={styles.booking}>
          <Text>{`${new Date(booking.startDate).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true
          })}: ${booking.initials}`}</Text>
          <Button title="Delete" onPress={() => deleteBooking(eventId)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  booking: {
    marginVertical: 8
  }
});
