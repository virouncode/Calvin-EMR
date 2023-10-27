import interaction from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import resourceTimeGrid from "@fullcalendar/resource-timegrid";
import React from "react";
import { rooms } from "../../utils/rooms";

const TimelineView = ({
  slotDuration,
  firstDay,
  fcRef,
  events,
  isSecretary,
  handleDatesSet,
  handleEventClick,
  handleDateSelect,
  handleDragStart,
  handleDrop,
  handleResize,
  handleResizeStart,
  renderEventContent,
}) => {
  return (
    <FullCalendar
      plugins={[resourceTimeGrid, interaction]}
      //===================Design=====================//
      headerToolbar={{
        start: "title",
        // center: "resourceTimeGridDay",
        end: "prev today next",
      }}
      slotLabelFormat={{
        hour: "numeric",
        minute: "2-digit",
        omitZeroMinute: true,
        meridiem: "short",
      }}
      buttonText={{
        today: "Today",
        // month: "Month",
        // week: "Week",
        // day: "Day",
      }}
      // views={
      //   {
      //     // resourceTimeGridDay: {
      //     //   slotLabelFormat: [
      //     //     { weekday: "long" },
      //     //     { hour: "numeric", omitZeroMinute: true, meridiem: "short" },
      //     //   ],
      //     // },
      //     // resourceTimeGridWeek: {
      //     //   slotDuration: "00:30",
      //     //   slotLabelFormat: [
      //     //     {
      //     //       day: "numeric",
      //     //       weekday: "short",
      //     //       // month: "short",
      //     //     },
      //     //     {
      //     //       hour: "numeric",
      //     //       minute: "2-digit",
      //     //       omitZeroMinute: true,
      //     //       meridiem: "short",
      //     //     },
      //     //   ],
      //     // },
      //   }
      // }
      resourceAreaHeaderContent="Rooms"
      resourceAreaWidth="10%"
      initialView="resourceTimeGridDay"
      slotDuration={slotDuration}
      firstDay={firstDay}
      weekNumbers={true}
      nowIndicator={true}
      eventTextColor="#FEFEFE"
      eventColor={isSecretary() ? "#bfbfbf" : "#6490D2"}
      slotLabelInterval="01:00"
      navLinks={true}
      navLinkDayClick="timeGrid"
      // weekText="Week"
      aspectRatio="2"
      expandRows={true}
      eventMinWidth="5"
      //==================== INTERACTION ====================//
      selectable={true}
      selectMirror={true}
      eventResizableFromStart={true}
      editable={true}
      unselectAuto={false}
      allDayMaintainDuration={true}
      ref={fcRef}
      //==================== CALLBACKS ====================//
      resources={rooms.map((room) => {
        return { id: room.id, title: room.title };
      })}
      events={events}
      datesSet={handleDatesSet}
      eventClick={handleEventClick}
      select={handleDateSelect}
      eventDragStart={handleDragStart}
      eventDrop={handleDrop}
      eventResize={handleResize}
      eventResizeStart={handleResizeStart}
      //====================== EVENT STYLING =================//
      eventContent={renderEventContent}
      eventClassNames={function (arg) {
        return `event-${arg.event.id}`;
      }}
    />
  );
};

export default TimelineView;
