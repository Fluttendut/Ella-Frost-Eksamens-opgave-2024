import { router } from "expo-router";
import { getDatabase, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CalendarList } from "react-native-calendars";

export default function CalendarScreen() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, "bookings");
    onValue(bookingsRef, snapshot => {
      const data = snapshot.val();

      console.log("data", data);
    });
  }, []);



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hardware Swap Calendar</Text>
      <CalendarList
        onDayPress={day => {
          router.push({
            pathname: "/modal-add-swap",
            params: { selectedDate: day.dateString }
          });
        }}
        theme={{
          selectedDayBackgroundColor: "#00adf5",
          todayTextColor: "#00adf5",
          arrowColor: "orange"
        }}
      />
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },
  slotContainer: {
    width: "100%",
    paddingHorizontal: 20
  },
  selectedDate: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  slot: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: "100%",
    alignItems: "center"
  },
  availableSlot: {
    backgroundColor: "green"
  },
  bookedSlot: {
    backgroundColor: "red"
  },
  slotText: {
    color: "white",
    fontWeight: "bold"
  },
  inputContainer: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
    width: "100%"
  }
});
