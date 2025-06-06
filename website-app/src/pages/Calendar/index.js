import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";
import { useAuth } from "../../components/introduce/useAuth";
import { useLoading } from "../../components/introduce/Loading";
import { notify } from "../../components/Notification/notification";

const localizer = momentLocalizer(moment);

const CalendarComponent = ({ defaultView }) => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    employee: "",
    start_time: "",
    end_time: "",
  });
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
      const response = await fetch(
        `http://localhost:8080/api/calendar/show?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
    const fetchData = async () => {
      if (user) {
        await fetchEvents(user.id_owner);
      }
    };
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
      const response = await fetch(
        "http://localhost:8080/api/calendar/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: formData.title,
            employee: formData.employee,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            id_owner: user.id_owner,
          }),
        }
      );

      if (response.ok) {
        notify(1, "Thêm lịch làm việc thành công", "Thành công");
      }
      if (!response.ok) {
        notify(2, "Thêm lịch làm việc thất bại", "Thất bại");
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
      start: moment(selectedEvent.start)
        .set({
          hour: parseInt(formData.start_time.split(":")[0]),
          minute: parseInt(formData.start_time.split(":")[1]),
        })
        .toDate(),
      end: moment(selectedEvent.start)
        .set({
          hour: parseInt(formData.end_time.split(":")[0]),
          minute: parseInt(formData.end_time.split(":")[1]),
        })
        .toDate(),
    };
    console.log(updatedEvent, selectedEvent.id);

    try {
      const response = await fetch(
        `http://localhost:8080/api/calendar/update/${selectedEvent.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: formData.title,
            employee: formData.employee,
            start_time: updatedEvent.start.toISOString(),
            end_time: updatedEvent.end.toISOString(),
            id_owner: user.id_owner,
          }),
        }
      );

      if (response.ok) {
        notify(1, "SửaSửa lịch làm việc thành công", "Thành công");
      }
      if (!response.ok) {
        notify(2, "Sửa lịch làm việc thất bại", "Thất bại");
        throw new Error("Failed to delete event");
      }

      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id ? updatedEvent : event
        )
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
      const response = await fetch(
        `http://localhost:8080/api/calendar/delete/${selectedEvent.id}?id_owner=${user.id_owner}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      if (response.ok) {
        notify(1, "Xóa lịch làm việc thành công", "Thành công");
      }
      if (!response.ok) {
        notify(2, "Xóa lịch làm việc thất bại", "Thất bại");
        throw new Error("Failed to delete event");
      }

      setEvents((prev) =>
        prev.filter((event) => event.id !== selectedEvent.id)
      );
      closeModal();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
    stopLoading();
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: 24,
        background:
          "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        borderRadius: 24,
        boxShadow: "0 8px 32px 0 rgba(30,136,229,0.10)",
        transition: "box-shadow 0.4s, background 0.4s",
      }}
    >
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h2
          style={{
            color: "#1e88e5",
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: 1,
            textShadow: "0 2px 8px #b3c6ff33",
            marginBottom: 0,
            transition: "color 0.3s",
          }}
        >
          Lịch làm việc
        </h2>
        <div
          style={{
            color: "#888",
            fontSize: 16,
            marginTop: 4,
          }}
        >
          Quản lý công việc, lịch trình cho nhân viên
        </div>
      </div>
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 4px 24px #b3c6ff22",
          background: "#fff",
          transition: "box-shadow 0.3s, background 0.3s",
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: 540,
            background: "#fff",
            borderRadius: 18,
            padding: 16,
            transition: "box-shadow 0.3s, background 0.3s",
          }}
          selectable
          defaultView={defaultView}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => ({
            style: {
              background:
                "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
              color: "#1e88e5",
              borderRadius: 10,
              border: "none",
              boxShadow: "0 2px 8px #a1c4fd33",
              fontWeight: 600,
              fontSize: 16,
              transition:
                "background 0.3s, color 0.3s, box-shadow 0.3s",
            },
          })}
          popup
        />
      </div>
      {isModalOpen && (
        <div
          className="ca-modal-overlay"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(30,136,229,0.10)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.3s",
          }}
        >
          <div
            className="ca-modal"
            style={{
              background:
                "linear-gradient(135deg, #e0e7ff 0%, #fffde4 100%)",
              borderRadius: 18,
              boxShadow: "0 8px 32px 0 rgba(30,136,229,0.15)",
              padding: 32,
              minWidth: 340,
              minHeight: 220,
              animation:
                "fadeInScale 0.4s cubic-bezier(.4,2,.6,1)",
              transition: "box-shadow 0.4s, background 0.4s",
            }}
          >
            <h2
              style={{
                color: "#1e88e5",
                fontWeight: 700,
                fontSize: 24,
                marginBottom: 18,
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              {" "}
              {selectedEvent ? "Chỉnh sửa sự kiện" : "Thêm sự kiện"}
            </h2>
            <form
              className="ca-modal-form"
              onSubmit={selectedEvent ? handleEditEvent : handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <label
                style={{
                  fontWeight: 600,
                  color: "#1e88e5",
                }}
              >
                Việc cần làm:
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                style={{
                  borderRadius: 10,
                  padding: 8,
                  border: "1px solid #b3c6ff",
                }}
              />
              <label
                style={{
                  fontWeight: 600,
                  color: "#1e88e5",
                }}
              >
                Tên nhân viên:
              </label>
              <input
                type="text"
                value={formData.employee}
                onChange={(e) =>
                  setFormData({ ...formData, employee: e.target.value })
                }
                required
                style={{
                  borderRadius: 10,
                  padding: 8,
                  border: "1px solid #b3c6ff",
                }}
              />
              <label
                style={{
                  fontWeight: 600,
                  color: "#1e88e5",
                }}
              >
                Thời gian làm (bắt đầu):
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
                style={{
                  borderRadius: 10,
                  padding: 8,
                  border: "1px solid #b3c6ff",
                }}
              />
              <label
                style={{
                  fontWeight: 600,
                  color: "#1e88e5",
                }}
              >
                Thời gian làm (kết thúc):
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                required
                style={{
                  borderRadius: 10,
                  padding: 8,
                  border: "1px solid #b3c6ff",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                  justifyContent: "center",
                }}
              >
                <button
                  type="submit"
                  style={{
                    background:
                      "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
                    color: "#1e88e5",
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: "8px 24px",
                    border: "none",
                    fontSize: 16,
                    cursor: "pointer",
                    transition: "background 0.3s",
                  }}
                >
                  {selectedEvent ? "Lưu thay đổi" : "Lưu"}
                </button>
                {selectedEvent && (
                  <button
                    type="button"
                    className="danger"
                    onClick={handleDeleteEvent}
                    style={{
                      background:
                        "linear-gradient(90deg, #fda085 0%, #f6d365 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: "8px 24px",
                      border: "none",
                      fontSize: 16,
                      cursor: "pointer",
                      transition: "background 0.3s",
                    }}
                  >
                    Xóa
                  </button>
                )}
                <button
                  type="button"
                  className="exit"
                  onClick={closeModal}
                  style={{
                    background: "#fff",
                    color: "#1e88e5",
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: "8px 24px",
                    border: "1px solid #b3c6ff",
                    fontSize: 16,
                    cursor: "pointer",
                    transition: "background 0.3s",
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .rbc-event, .rbc-selected {
          transition: box-shadow 0.3s, background 0.3s, color 0.3s;
        }
        .rbc-event:active, .rbc-event:focus, .rbc-selected {
          box-shadow: 0 4px 16px #1e88e522;
          background: linear-gradient(90deg, #c2e9fb 0%, #a1c4fd 100%) !important;
          color: #0d47a1 !important;
        }
        .rbc-today {
          background: #e3f2fd !important;
          transition: background 0.3s;
        }
        .rbc-toolbar button {
          background: linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%);
          color: #1e88e5;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          margin: 0 2px;
          transition: background 0.3s, color 0.3s;
        }
        .rbc-toolbar button:active, .rbc-toolbar button:focus {
          background: #1e88e5;
          color: #fff;
        }
        .rbc-toolbar-label {
          color: #1e88e5;
          font-weight: 700;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
};

export default CalendarComponent;
