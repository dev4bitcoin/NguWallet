import PushNotification, { Importance } from 'react-native-push-notification';
import NotificationHandler from './NotificationHandler';

export default class NotificationService {
    constructor(onRegister, onNotification) {
        NotificationHandler.attachRegister(onRegister);
        NotificationHandler.attachNotification(onNotification);

        // Clear badge number at start
        // PushNotification.getApplicationIconBadgeNumber(function (number) {
        //     if (number > 0) {
        //         PushNotification.setApplicationIconBadgeNumber(0);
        //     }
        // });
    }

    popInitialNotification() {
        PushNotification.popInitialNotification((notification) => console.log('InitialNotication:', notification));
    }

    checkPermission(cbk) {
        return PushNotification.checkPermissions(cbk);
    }

    requestPermissions() {
        return PushNotification.requestPermissions();
    }

    cancelNotif() {
        PushNotification.cancelLocalNotification(this.lastId);
    }

    cancelAll() {
        PushNotification.cancelAllLocalNotifications();
    }

    abandonPermissions() {
        PushNotification.abandonPermissions();
    }

    getScheduledLocalNotifications(callback) {
        PushNotification.getScheduledLocalNotifications(callback);
    }

    getDeliveredNotifications(callback) {
        PushNotification.getDeliveredNotifications(callback);
    }
}