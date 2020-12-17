import React, { createRef, useEffect, useRef } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { Plugins } from '@capacitor/core';
import { IonApp, IonModal, IonRouterOutlet, isPlatform } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ProtectedRoute } from './core/auth';
import LoginPage from './login/LoginPage';
import Tabs from './Tabs';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/global.css';

const App: React.FC = () => {
  useEffect(() => {
    const { SplashScreen } = Plugins;
    if (isPlatform('capacitor')) SplashScreen.hide();
  }, []);

  const passcodeModal = createRef<HTMLIonModalElement>();

  useEffect(() => {
    console.log(passcodeModal.current?.dismiss());
  }, [passcodeModal]);

  return (
    <IonApp>
      <IonModal isOpen={true} ref={passcodeModal} onDidDismiss={() => {}}>
        <p>Test</p>
      </IonModal>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/login" component={LoginPage} />
          <ProtectedRoute path="/tabs" component={Tabs} />
          <Route exact path="/" render={() => <Redirect to="/login" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
