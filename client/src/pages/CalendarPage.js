import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Calendar from "../components/Calendar/Calendar";
import ToggleView from "../components/Calendar/ToggleView";

const CalendarPage = () => {
  const [timelineVisible, setTimelineVisible] = useState(false);

  return (
    <>
      <Helmet>
        <title>Calendar</title>
      </Helmet>
      <section className="calendar-section">
        <h2 className="calendar-section__title">Calendar</h2>
        <ToggleView
          setTimelineVisible={setTimelineVisible}
          timelineVisible={timelineVisible}
        />
        <Calendar timelineVisible={timelineVisible} />
      </section>
    </>
  );
};

export default CalendarPage;
