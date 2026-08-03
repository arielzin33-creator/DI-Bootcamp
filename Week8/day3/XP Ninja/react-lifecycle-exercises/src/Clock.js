import React, { Component } from "react";
import "./Clock.css";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// The four cardinal points of the compass, shown at the
// 12 / 3 / 6 / 9 o'clock positions instead of those hour numbers.
const COMPASS_BY_HOUR = { 12: "N", 3: "E", 6: "S", 9: "W" };

/* ============================================================
   Exercise 1 : React Clock
   A class component that keeps the current year, month, weekday,
   day of the month, hour, minute and second in its state, and
   renders them as an analog, compass-style clock face.
   ============================================================ */
class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDateParts();
  }

  // Reads a fresh Date object and breaks it down into the pieces
  // asked for in the instructions.
  getDateParts() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(), // 0-11
      weekday: now.getDay(), // 0-6
      dayOfMonth: now.getDate(), // 1-31
      hours: now.getHours(), // 0-23
      minutes: now.getMinutes(), // 0-59
      seconds: now.getSeconds(), // 0-59
    };
  }

  // As soon as the component mounts, start a timer that refreshes
  // the state - and therefore the clock face - once every second.
  componentDidMount() {
    this.timerID = setInterval(() => {
      this.setState(this.getDateParts());
    }, 1000);
  }

  // Always clean up timers when the component is about to unmount,
  // otherwise it would keep calling setState on a component that no
  // longer exists.
  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    const { year, month, weekday, dayOfMonth, hours, minutes, seconds } =
      this.state;

    // Angles used to rotate the three hands around the clock face.
    // Each unit (hour / minute / second) covers 360deg / its own
    // range, and the hour and minute hands also creep forward
    // based on the smaller units, just like a real clock.
    const secondsDegrees = seconds * 6; // 360 / 60
    const minutesDegrees = minutes * 6 + seconds * 0.1;
    const hoursDegrees = (hours % 12) * 30 + minutes * 0.5; // 360 / 12

    return (
      <div className="clock-wrapper">
        <div className="clock-face">
          {/* Exercise 1, point 3 : year top left, month bottom right */}
          <div className="clock-year">{year}</div>
          <div className="clock-month">{MONTHS[month]}</div>

          {/* The 12 clock positions, in "rotated format" : each
              marker is rotated by 30deg increments around the
              center, then counter-rotated so its label stays
              upright. The compass points (N / E / S / W) replace
              the 12 / 3 / 6 / 9 hour numbers. */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((hourMark) => {
            const label = COMPASS_BY_HOUR[hourMark] || hourMark;
            const isCompassPoint = Boolean(COMPASS_BY_HOUR[hourMark]);
            return (
              <div
                key={hourMark}
                className="clock-hour-mark"
                style={{ transform: `rotate(${hourMark * 30}deg)` }}
              >
                <span
                  className={isCompassPoint ? "clock-compass-label" : ""}
                  style={{ transform: `rotate(-${hourMark * 30}deg)` }}
                >
                  {label}
                </span>
              </div>
            );
          })}

          {/* The three hands, all rotated from the same center */}
          <div
            className="clock-hand clock-hour-hand"
            style={{ transform: `rotate(${hoursDegrees}deg)` }}
          />
          <div
            className="clock-hand clock-minute-hand"
            style={{ transform: `rotate(${minutesDegrees}deg)` }}
          />
          <div
            className="clock-hand clock-second-hand"
            style={{ transform: `rotate(${secondsDegrees}deg)` }}
          />

          <div className="clock-center-dot" />

          {/* Exercise 1, point 4 : the same date/time, but written
              out as plain, linear (non-rotated) text. */}
          <div className="clock-digital-readout">
            <div className="clock-digital-date">
              {WEEKDAYS[weekday]}, {MONTHS[month]} {dayOfMonth}, {year}
            </div>
            <div className="clock-digital-time">
              {String(hours).padStart(2, "0")}:
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Clock;
