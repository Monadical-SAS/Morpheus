# Firebase Integration Guide

Morpheus integrates Firebase's authentication and analytics services to allow users to securely register and access the
app, and to collect data on user behavior that can be used to improve the app. Additionally, due to the integration of
[Excalidraw](https://github.com/excalidraw/excalidraw) for the collaborative painting system, Firestore and Storage
services are used to support it. These systems are decoupled and can be deactivated or replaced if
necessary.

To enable Firebase services, you must create a Firebase project and configure the client application. The following
sections explain how to do this.

# Client Credential Setup

1. Visit https://console.firebase.google.com/
2. Create a new project.
   ![image info](./images/1-add-project.png)
3. Assign a name to the project and follow the instructions. Makes sure to enable Google Analytics.
   ![image info](./images/2-project-name.png)
4. In the project console, add a web application.
   ![image info](./images/3-add-app.png)
5. Name the application and continue.
   ![image info](./images/4-register-app.png)
6. Copy the firebaseConfig value, open the browser dev tools and convert it to a string.
   ![image info](./images/5-add-firebase-sdk.png)
7. Copy the console output value and put it in the NEXT_PUBLIC_FIREBASE_CONFIG environment variable in
   /morpheus-client/env.local
   ![image info](./images/6-stringify-config.png)

## Firebase Authentication

1. In the 'Build' section of the sidebar, select 'Authentication'.
   ![image info](./images/7-add-auth.png)
2. Click "Get Started" to activate authentication.
3. In the providers section, enable options for email and password and Google.
   ![image info](./images/8-add-providers.png)
   ![image info](./images/9-auth-email-password.png)
   ![image info](./images/10-auth-google.png)
   ![image info](./images/11-sign-in-providers.png)
4. For authentication to work in production, register your application's domain in Settings > Authorized Domains.
   ![image info](./images/12-auth-domain.png)

Note: Morpheus supports email and password and Google authentication by default. If you want to integrate more
providers, activate them from the Firebase Auth providers section and extend Morpheus' code base.

## Firebase Analytics

Morpheus uses Firebase Analytics to collect data on the use of the client application. This option is activated in step
3 of the previous section. To view Analytics data:

1. In the sidebar, select 'Analytics' and open the dashboard.
2. In the dashboard, you will find the application usage data.
   ![image info](./images/13-add-analytics.png)
3. For more details, use the "View more in Google Analytics" link at the top right.

## Firebase Firestore

Morpheus uses Firestore to support the collaborative painting system
of [Excalidraw](https://github.com/excalidraw/excalidraw). To activate it:

1. In 'Build', choose 'Firestore Database'.
   ![image info](./images/14-analytics-dashboard.png)
2. Click "Create database", choose the location, and proceed.
3. Choose 'Start in test mode' and continue.
   ![image info](./images/15-firestore-rules.png)
4. Add an initial record to the database.
   ![image info](./images/16-firestore-test-collection.png)
5. Complete the new record form and save it.
   ![image info](./images/17-firestore-test-document.png)
6. Verify the new record in the database.
   ![image info](./images/18-firestore-test-result.png)

## Firebase Storage

Firebase Storage is used to store images from the Excalidraw collaborative painting system. To activate it:

1. In 'Build', choose 'Storage'.
   ![image info](./images/19-add-storage.png)
2. Click "Get Started" to activate the service.
3. Choose 'Start in test mode' and continue, then click 'Done'.
   ![image info](./images/20-storage-rules.png)
4. Add a file to Storage and review it in the file section.
5. Verify the new file in the file section.
   ![image info](./images/21-storage-result.png)