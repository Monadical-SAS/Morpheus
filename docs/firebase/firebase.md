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
   <img src="./images/1-add-project.png" width="800" style="display: block" />
3. Assign a name to the project and follow the instructions. Makes sure to enable Google Analytics.
   <img src="./images/2-project-name.png" width="800" style="display: block" />
4. In the project console, add a web application.
   <img src="./images/3-add-app.png" width="800" style="display: block" />
5. Name the application and continue.
   <img src="./images/4-register-app.png" width="800" style="display: block" />
6. Copy the firebaseConfig value, open the browser dev tools and convert it to a string.
   <img src="./images/5-add-firebase-sdk.png" width="800" style="display: block" />
7. Copy the console output value and put it in the NEXT_PUBLIC_FIREBASE_CONFIG environment variable in
   /morpheus-client/env.local
   <img src="./images/6-stringify-config.png" width="800" style="display: block" />

## Firebase Authentication

1. In the 'Build' section of the sidebar, select 'Authentication'.
   <img src="./images/7-add-auth.png" width="800" style="display: block" />
2. Click "Get Started" to activate authentication.
3. In the providers section, enable options for email and password and Google.
   <img src="./images/8-add-providers.png" width="800" style="display: block" />
   <img src="./images/9-auth-email-password.png" width="800" style="display: block" />
   <img src="./images/10-auth-google.png" width="800" style="display: block" />
   <img src="./images/11-sign-in-providers.png" width="800" style="display: block" />
4. For authentication to work in production, register your application's domain in Settings > Authorized Domains.
   <img src="./images/12-auth-domain.png" width="800" style="display: block" />

Note: Morpheus supports email and password and Google authentication by default. If you want to integrate more
providers, activate them from the Firebase Auth providers section and extend Morpheus' code base.

## Firebase Analytics

Morpheus uses Firebase Analytics to collect data on the use of the client application. This option is activated in step
3 of the previous section. To view Analytics data:

1. In the sidebar, select 'Analytics' and open the dashboard.
2. In the dashboard, you will find the application usage data.
   <img src="./images/13-add-analytics.png" width="800" style="display: block" />
3. For more details, use the "View more in Google Analytics" link at the top right.

## Firebase Firestore

Morpheus uses Firestore to support the collaborative painting system
of [Excalidraw](https://github.com/excalidraw/excalidraw). To activate it:

1. In 'Build', choose 'Firestore Database'.  
   <img src="./images/14-add-firestore.png" width="800" style="display: block" />
2. Click "Create database", choose the location, and proceed.
3. Choose 'Start in test mode' and continue.
   <img src="./images/15-firestore-rules.png" width="800" style="display: block" />
4. Add an initial record to the database.
   <img src="./images/16-firestore-test-collection.png" width="800" style="display: block" />
5. Complete the new record form and save it.
   <img src="./images/17-firestore-test-document.png" width="800" style="display: block" />
6. Verify the new record in the database.
   <img src="./images/18-firestore-test-result.png" width="800" style="display: block" />

## Firebase Storage

Firebase Storage is used to store images from the Excalidraw collaborative painting system. To activate it:

1. In 'Build', choose 'Storage'.
   <img src="./images/19-add-storage.png" width="800" style="display: block" />
2. Click "Get Started" to activate the service.
3. Choose 'Start in test mode' and continue, then click 'Done'.
   <img src="./images/20-storage-rules.png" width="800" style="display: block" />
4. Add a file to Storage and review it in the file section.
5. Verify the new file in the file section.
   <img src="./images/21-storage-result.png" width="800" style="display: block" />