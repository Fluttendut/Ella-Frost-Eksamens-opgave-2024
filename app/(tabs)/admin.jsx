import { auth } from "@/firebase-config";
import { Stack, router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, onValue, ref, remove } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function AdminScreen() {
  const [bookings, setBookings] = useState([]); // This is a hook that stores the bookings from the database

  // This useEffect hook checks if the user is signed in
  useEffect(() => {
    // This listens for changes to the authentication state
    const unsubscribe = onAuthStateChanged(auth, user => {
      // This checks if the user is signed in
      if (!user) {
        // No user is signed in.
        router.replace("/sign-in"); // This navigates to the sign-in screen if the user is not signed in
      }
    });
    // This returns a function that unsubscribes from the listener when the component is unmounted
    return () => unsubscribe();
  }, []); // This hook runs once when the component is mounted

  // This useEffect hook fetches the bookings from the database
  useEffect(() => {
    const db = getDatabase(); // This gets the database object
    const bookingsRef = ref(db, "bookings"); // This gets the reference to the bookings collection in the database
    // This listens for changes to the bookings collection in the database
    onValue(bookingsRef, snapshot => {
      const data = snapshot.val(); // This gets the data from the snapshot. Snapshot is an object that contains the data from the database
      setBookings(data ? Object.entries(data) : []); // This sets the bookings hook with the data from the snapshot
    });
  }, []);

  // This function deletes a booking from the database
  const deleteBooking = async eventId => {
    const db = getDatabase(); // This gets the database object
    await remove(ref(db, `bookings/${eventId}`)); // This removes the booking from the database
    Alert.alert("Booking deleted"); // This displays an alert that the booking was deleted
  };

  // This function handles signing out the user
  async function handleSignOut() {
    await signOut(auth); // This signs out the user
    router.replace("/"); // This navigates to the home screen
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