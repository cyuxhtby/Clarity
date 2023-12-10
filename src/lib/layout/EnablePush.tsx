import React, { useState, useEffect } from 'react';
import { IconButton } from '@chakra-ui/react';
import { IoNotifications } from 'react-icons/io5';
import { requestPermission } from '~/lib/utils/firebaseMessaging'; 

const EnablePush = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    setHasPermission(Notification.permission === 'granted');
  }, []);

  if (hasPermission) {
    return null;
  }

  const handlePermissionRequest = async () => {
    await requestPermission();
    setHasPermission(Notification.permission === 'granted');
  };

  return (
    <IconButton
      aria-label="enable push notifications"
      icon={<IoNotifications />}
      onClick={handlePermissionRequest}
      mr={4}
    />
  );
};

export default EnablePush;
