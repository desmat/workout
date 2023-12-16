'use client'

import moment from 'moment';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon, QuestionMarkCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid'
import useAlert from '@/app/_hooks/alert';
import { AlertType } from '@/types/Alert';

// from https://tailwindui.com/components/application-ui/feedback/alerts

function Alert({
  message,
  type,
  closed,
  handleClose,
}: {
  message: string,
  type: AlertType,
  closed: boolean,
  handleClose: any,
}) {
  console.log('>> app._components.Alert.Alert.render()', { message, type, closed });
  let color;
  let icon;

  switch (type) {
    case 'error':
      color = "red";
      icon = <ExclamationCircleIcon className={`h-5 w-5 text-${color}-400`} aria-hidden="true" />
      break;
    case "warning":
      color = "yellow";
      icon = <ExclamationCircleIcon className={`h-5 w-5 text-${color}-400`} aria-hidden="true" />
      break;
    case "success":
      color = "green";
      icon = <CheckCircleIcon className={`h-5 w-5 text-${color}-400`} aria-hidden="true" />
      break;
    default: //case "info":
      color = "blue";
      icon = <InformationCircleIcon className={`h-5 w-5 text-${color}-400`} aria-hidden="true" />
      break;
  }

  return (
    <div className={`fixed bottom-3 left-3 md:left-[calc(50vw-(700px/2))] lg:left-[calc(50vw-((700px-8rem)/2))] ${closed ? "_-z-10" : "z-20"}`}>
      <div className={`${closed ? "opacity-0" : "opacity-100"} transition-all rounded-md bg-${color}-50 p-4 w-[calc(100vw-1.5rem)] md:w-[700px] shadow-md hover:shadow-lg`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium text-${color}-800`}>{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md bg-${color}-50 p-1.5 text-${color}-500 hover:bg-${color}-100 focus:outline-none active:bg-${color}-200 _focus:ring-2 _focus:ring-${color}-600 focus:ring-offset-2 _focus:ring-offset-${color}-50`}
                onClick={handleClose}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// handle closed and pulse effect
function AnimatedAlert({
  message,
  type,
  timestamp,
}: {
  message: string,
  type: AlertType,
  timestamp: number
}) {
  const [setError] = useAlert((state: any) => [state.error]);
  const [lastMessage, setLastMessage] = useState<string | undefined>(message);
  let [dismissedAt, setDismissedAt] = useState<number | undefined>();


  useEffect(() => {
    // console.log('>> app._components.Alert.AnimatedAlert.render() useEffect', { message, lastMessage, timestamp });

    // make the thing pulse a bit when same message but was not dismissed
    if (lastMessage && (message == lastMessage) && !dismissedAt) {
      // console.log('>> app._components.Alert.AnimatedAlert.render() useEffect starting pulse', { message, lastMessage, timestamp });
      dismissedAt = timestamp; // not quite sure why but there's a race condition causing a visual glitch and this fixes it
      setDismissedAt(moment().valueOf());

      setTimeout(() => {
        // console.log('>> app._components.Alert.AnimatedAlert.render() useEffect finishing pulse', { message, lastMessage, timestamp });
        setDismissedAt(undefined);
      }, 50);
    }

    if (timestamp != dismissedAt) {
      setDismissedAt(undefined);
    }

    setLastMessage(message);
  }, [message, timestamp]);

  const handleClose = () => {
    setDismissedAt(timestamp);
    setTimeout(() => {
      setError(undefined);
    }, 50);
  }

  // console.log('>> app._components.Alert.AnimatedAlert.render()', { message, timestamp, lastMessage, dismissedAt });

  if (message) {
    return (
      <Alert message={message} type={type} closed={!!dismissedAt} handleClose={handleClose} />
    )
  }
}

export function Error({
  message,
  type,
}: {
  message?: string | undefined,
  type?: AlertType | undefined
}) {
  const [_message, _type] = useAlert((state: any) => [state.message, state.type]);

  // console.log('>> app._components.Alert.Error.render()', { message, _message });

  return (
    <AnimatedAlert message={message || _message} type={type || _type || "info"} timestamp={moment().valueOf()} />
  )
}
