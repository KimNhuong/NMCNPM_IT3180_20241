import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";
import { useAuth } from "../../components/introduce/useAuth";
import { useLoading } from "../../components/introduce/Loading";
import { notify } from "../../components/Notification/notification";

const localizer = momentLocalizer(moment);

const CalendarComponent = ({defaultView}) => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", employee: "", start_time: "", end_time: "" });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user, loading } = useAuth();
  const { startLoading, stopLoading } = useLoading(); 

  const formatEvents = (data) =>
    data.map((event) => ({
      id: event.id,
      title: `${event.task} - ${event.employee}`,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
    }));

    const fetchEvents = async (userId) => {
      try {
        const response = await fetch(`http://localhost:5000/calendar/show?userId=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) throw new Error("Failed to fetch events");
  
        const data = await response.json();
        setEvents(formatEvents(data));
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
  // Fetch sự kiện từ server
  useEffect(() => {
    startLoading();
    const fetchData = async () =>{
      if(user){
        await fetchEvents(user.id_owner);
      }
    }
    fetchData();
    stopLoading();
  }, [user]);

  // Xử lý chọn slot trống
  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setFormData({ title: "", employee: "", start_time: "", end_time: "" });
    setIsModalOpen(true);
  };

  // Xử lý chọn một sự kiện
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title.split(" - ")[0],
      employee: event.title.split(" - ")[1],
      start_time: moment(event.start).format("HH:mm"),
      end_time: moment(event.end).format("HH:mm"),
    });
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
    setFormData({ title: "", employee: "", start_time: "", end_time: "" });
  };

  // Gửi sự kiện mới lên server
  const handleSubmit = async (e) => {
    e.preventDefault();
    startLoading();

    const startDateTime = moment(selectedSlot.start).set({
      hour: parseInt(formData.start_time.split(":")[0]),
      minute: parseInt(formData.start_time.split(":")[1]),
    });

    const endDateTime = moment(selectedSlot.start).set({
      hour: parseInt(formData.end_time.split(":")[0]),
      minute: parseInt(formData.end_time.split(":")[1]),
    });

    const newEvent = {
      title: `${formData.title} - ${formData.employee}`,
      start: startDateTime.toDate(),
      end: endDateTime.toDate(),
    };

    try {
      const response = await fetch("http://localhost:5000/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: formData.title,
          employee: formData.employee,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          id_owner: user.id_owner,
        }),
      });

      if(response.ok){
        notify(1,"Thêm lịch làm việc thành công","Thành công");
      }
      if (!response.ok){
        notify(2,"Thêm lịch làm việc thất bại","Thất bại");
        throw new Error("Failed to delete event");
      } 

      setEvents([...events, newEvent]);
      await fetchEvents(user.id_owner);
      stopLoading();
      closeModal();
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // Cập nhật sự kiện
  const handleEditEvent = async (e) => {
    e.preventDefault();
    startLoading();
    const updatedEvent = {
      id: selectedEvent.id,
      title: `${formData.title} - ${formData.employee}`,
      start: moment(selectedEvent.start).set({
        hour: parseInt(formData.start_time.split(":")[0]),
        minute: parseInt(formData.start_time.split(":")[1]),
      }).toDate(),
      end: moment(selectedEvent.start).set({
        hour: parseInt(formData.end_time.split(":")[0]),
        minute: parseInt(formData.end_time.split(":")[1]),
      }).toDate(),
    };
    console.log(updatedEvent, selectedEvent.id);
    
    try {
      const response = await fetch(`http://localhost:5000/calendar/update/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: formData.title,
          employee: formData.employee,
          start_time: updatedEvent.start.toISOString(),
          end_time: updatedEvent.end.toISOString(),
          id_owner: user.id_owner,
        }),
      });

      if(response.ok){
        notify(1,"SửaSửa lịch làm việc thành công","Thành công");
      }
      if (!response.ok){
        notify(2,"Sửa lịch làm việc thất bại","Thất bại");
        throw new Error("Failed to delete event");
      } 

      setEvents((prev) =>
        prev.map((event) => (event.id === selectedEvent.id ? updatedEvent : event))
      );
      closeModal();
    } catch (error) {
      console.error("Error updating event:", error);
    }
    stopLoading();
  };

  // Xóa sự kiện
  const handleDeleteEvent = async (e) => {
    e.preventDefault();
    startLoading();
    try {
      const response = await fetch(`http://localhost:5000/calendar/delete/${selectedEvent.id}?id_owner=${user.id_owner}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });      
      console.log(response);
      if(response.ok){
        notify(1,"Xóa lịch làm việc thành công","Thành công");
      }
      if (!response.ok){
        notify(2,"Xóa lịch làm việc thất bại","Thất bại");
        throw new Error("Failed to delete event");
      } 

      setEvents((prev) => prev.filter((event) => event.id !== selectedEvent.id));
      closeModal();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
    stopLoading();
  };

  return (
    <div style={{ height: "80vh" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        defaultView={defaultView}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      {isModalOpen && (
        <div className="ca-modal-overlay">
          <div className="ca-modal">
            <h2>{selectedEvent ? "Chỉnh sửa sự kiện" : "Thêm sự kiện"}</h2>
            <form className="ca-modal-form" onSubmit={selectedEvent ? handleEditEvent : handleSubmit}>
              <label>Việc cần làm:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <label>Tên nhân viên:</label>
              <input
                type="text"
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                required
              />
              <label>Thời gian làm (bắt đầu):</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
              <label>Thời gian làm (kết thúc):</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
              <button type="submit">{selectedEvent ? "Lưu thay đổi" : "Lưu"}</button>
              {selectedEvent && (
                <button type="button" className="danger" onClick={handleDeleteEvent}>
                  Xóa
                </button>
              )}
              <button type="button" className="exit" onClick={closeModal}>
                Hủy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
