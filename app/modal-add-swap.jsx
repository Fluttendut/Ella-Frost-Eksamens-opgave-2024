import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
  Alert
} from "react-native";
import { useEffect, useState } from "react";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { Stack, router, useLocalSearchParams } from "expo-router";

export default function ModalScreen() {
  const { selectedDate } = useLocalSearchParams();
  const [initials, setInitials] = useState("");
  const [bookings, setBookings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, "bookings");
    onValue(bookingsRef, snapshot => {
      const data = snapshot.val();
      setBookings(data ? Object.values(data) : []);
    });
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate, bookings]);

  const fetchTimeSlots = date => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const slots = [];

    for (let hour = 9; hour < 18; hour += 1) {
      const slotTime = new Date(startOfDay);
      slotTime.setHours(startOfDay.getHours() + hour);
      if (slotTime > new Date()) {
        const isBooked = bookings.some(
          booking => booking.startDate === slotTime.getTime()
        );
        slots.push({
          dateTime: slotTime.getTime(),
          booked: isBooked
        });
      }
    }
    setTimeSlots(slots);
  };

  const createEvent = async () => {
    if (!initials.match(/^[a-zA-Z]+$/)) {
      Alert.alert("Please enter valid initials (letters only)");
      return;
    }

    const event = {
      title: `Hardware Swap Booking - ${initials}`,
      startDate: selectedSlot.dateTime,
      endDate: selectedSlot.dateTime + 60 * 60 * 1000,
      location: "IT Department",
      initials: initials
    };

    const db = getDatabase();
    const bookingId = selectedSlot.dateTime;

    const newBookingRef = ref(db, `bookings/${bookingId}`);
    set(newBookingRef, event);

    Alert.alert("Booking confirmed", `Booking ID: ${bookingId}`);
    setInitials("");
    fetchTimeSlots(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button title="Close" onPress={() => router.back()} />
          )
        }}
      />
      <Text style={styles.title}>Add Swapp</Text>

      <View style={styles.slotContainer}>
        <Text style={styles.selectedDate}>
          {new Date(selectedDate).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </Text>
        <FlatList
          style={{ width: "100%", marginBottom: 20 }}
          data={timeSlots}
          keyExtractor={item => item.time}
          renderItem={({ item: slot }) => (
            <TouchableOpacity
              style={[
                styles.slot,
                slot.booked ? styles.bookedSlot : styles.availableSlot
              ]}
              disabled={slot.booked}
              onPress={() => {
                setSelectedSlot(slot);
              }}>
              <Text style={styles.slotText}>
                {new Date(slot.dateTime).toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true
                })}{" "}
                {slot.booked ? "Booked" : "Available"}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.inputContainer}>
        {selectedSlot && (
          <Text>
            Selected Slot:{" "}
            {new Date(selectedSlot.dateTime).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true
            })}
          </Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Enter initials"
          value={initials}
          onChangeText={setInitials}
        />
        <Button title="Create Event" onPress={createEvent} />
      </View>
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
