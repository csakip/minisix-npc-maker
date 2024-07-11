import { useCallback, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useHotkeys } from "react-hotkeys-hook";
import { roll } from "../dice";
import Dice from "./Dice";
import RollNotification from "../classes/RollNotification";

export function useDiceRoller() {
  const [notifications, setNotifications] = useState([]);
  const rollDice = useCallback(
    (diceValue, title) => {
      const r = roll(diceValue);
      const newNotification = new RollNotification(title || diceValue / 3 + "d", r);
      setNotifications((prev) => [...prev, newNotification]);
      setTimeout(
        () =>
          setNotifications((notifications) =>
            notifications.filter((n) => n.id !== newNotification.id)
          ),
        10000
      );
    },
    [setNotifications]
  );

  const onHotkeys = useCallback(
    (e) => {
      const key = e.key === "0" ? 10 : parseInt(e.key);
      rollDice(key * 3);
    },
    [rollDice]
  );
  useHotkeys("1,2,3,4,5,6,7,8,9,0", onHotkeys);
  useHotkeys("esc", () => setNotifications([]));

  return {
    notifications,
    setNotifications,
    DiceRoller,
    rollDice,
  };

  function DiceRoller() {
    return (
      <ToastContainer position='bottom-end' className='p-3'>
        {notifications.map((notification) => (
          <Toast
            bg='success'
            key={notification.id}
            onClose={() => setNotifications(notifications.filter((n) => n !== notification))}>
            <Toast.Header>
              <strong className='me-auto'>{notification.title}</strong>
              <small className='text-muted'>{notification.time.toLocaleTimeString("hu-HU")}</small>
            </Toast.Header>
            <Toast.Body>{notification.roll && <Dice roll={notification.roll} />}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    );
  }
}
