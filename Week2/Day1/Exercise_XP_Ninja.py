# Exercise 1 : Call History

class Phone:
    def __init__ (self, phone_number):
        self.phone_number = phone_number
        self.call_history  = []
        self.messages = []

    def call (self, other_phone):
        record = f"{self.phone_number} called {other_phone.phone_number}"
        self.call_history.append(record)
        print(record)
        
    
    def show_call_history(self):
        print(f"Call history for {self.phone_number}:")
        if len(self.call_history) == 0:
            print("  No calls yet.")
        else:
            for record in self.call_history:
                print(f"  - {record}")

    def  send_message(self, other_phone, content):
        message = {
            "from": self.phone_number,
            "to":   other_phone.phone_number,
            "content": content
        }
        self.messages.append(message)
        other_phone.messages.append(message)
        print(f"Message sent from {self.phone_number} to {other_phone.phone_number}: '{content}'")

    def show_outgoing_messages(self):
        print(f"Outgoing messages from {self.phone_number}:")
        outgoing = [m for m in self.messages if m["from"] == self.phone_number]
        if not outgoing:
            print("  No outgoing messages.")
        for m in outgoing:
            print(f"  To {m['to']}: '{m['content']}'")

    def show_incoming_messages(self):
        print(f"\nIncoming messages for {self.phone_number}:")
        incoming = [m for m in self.messages if m["to"] == self.phone_number]
        if not incoming:
            print("  No incoming messages.")
        for m in incoming:
            print(f"  From {m['from']}: '{m['content']}'")

    def show_messages_from(self, other_phone):
        print(f"\nMessages received from {other_phone.phone_number}:")
        filtered = [m for m in self.messages if m["from"] == other_phone.phone_number]
        if not filtered:
            print(f"  No messages from {other_phone.phone_number}.")
        for m in filtered:
            print(f"  '{m['content']}'")

phone1 = Phone("050-1234567")
phone2 = Phone("052-9876543")
phone3 = Phone("054-1112233")

# Calls
phone1.call(phone2)
phone1.call(phone3)
phone2.call(phone1)

phone1.show_call_history()

# Messages
phone1.send_message(phone2, "Hey, are you free tonight?")
phone2.send_message(phone1, "Yes! What time?")
phone3.send_message(phone1, "Don't forget our meeting tomorrow.")
phone1.send_message(phone3, "On my way!")

phone1.show_outgoing_messages()
phone1.show_incoming_messages()
phone1.show_messages_from(phone2)