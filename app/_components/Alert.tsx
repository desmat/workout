'use client'

import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import moment from 'moment';
import { useEffect, useState } from 'react';
import useAlert from '../_hooks/alert';

const WIDTH = "700px";

function Alert({
  message,
  // type,
  timestamp,
}: {
  message: string,
  // type: string,
  timestamp: number
}) {
  const [dismissedAt, setDismissedAt] = useState<number|undefined>();
  const [setError] = useAlert((state: any) => [state.error]);
  // const [lastMessage, setLastMessage] = useState<string|undefined>(message);

  console.log('>> app._components.Alert._Error.render()', { message, timestamp });

  useEffect(() => {
    console.log('>> app._components.Alert._Error.render() useEffect', { message, timestamp });
    
    // make the thing pulse a bit when same message but was not dismissed
    if (message && !dismissedAt) {
      setDismissedAt(moment().valueOf());
      // setError(undefined);
      setTimeout(() => {
        setDismissedAt(undefined)
        // setError(_message);
      }, 100);
    }
 
    // setLastMessage(message);
  }, [message, timestamp]);

  const handleClose = () => {
    setDismissedAt(timestamp); 
    // setLastMessage(undefined); 
    setError(undefined);
  }

  return (
    <div className={`fixed bottom-3 left-3 md:left-[calc(50vw-(${WIDTH}/2))] lg:left-[calc(50vw-((${WIDTH}-8rem)/2))] ${dismissedAt ? "-z-10" : "z-20"}`}>
      <div className={`${dismissedAt ? "opacity-0" : "opacity-100"} transition-all rounded-md bg-red-50 p-4 w-[calc(100vw-1.5rem)] md:w-[${WIDTH}] shadow-md hover:shadow-lg`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none active:bg-red-200 _focus:ring-2 _focus:ring-red-600 focus:ring-offset-2 _focus:ring-offset-red-50"
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


export function Error({
  message,
}: {
  message?: string | undefined
}) {
  const [_message, type] = useAlert((state: any) => [state.message, state.type]);

  console.log('>> app._components.Alert.Error.render()', { message });

  if (message || _message && type == "error") {
    return (
      <Alert message={message || _message} timestamp={moment().valueOf()} />
    )
  }

  return <></>
}
