import { IconButton, useColorMode } from '@chakra-ui/react';
import { RiMoonFill, RiSunLine } from 'react-icons/ri';
import { IoNotifications } from "react-icons/io5";
import { IoMdNotificationsOff } from "react-icons/io";
import { requestPermission } from '~/lib/utils/firebaseMessaging';


const EnablePush = () => {
  return (
    <IconButton
      aria-label="theme toggle"
      icon={<IoNotifications />}
      onClick={requestPermission}
      mr={4}
    />
  );
};

export default EnablePush;
