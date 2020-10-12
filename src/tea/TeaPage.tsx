import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { useAuthentication } from '../core/auth';
import { useTea } from './useTea';
import { Tea } from '../shared/models';
import './TeaPage.css';

export const listToMatrix = (teaArray: Array<Tea>): Array<Array<Tea>> => {
  let teaMatrix: Array<Array<Tea>> = [];

  let row: Array<Tea> = [];
  teaArray.forEach(tea => {
    row.push(tea);
    if (row.length === 4) {
      teaMatrix.push(row);
      row = [];
    }
  });

  if (row.length) teaMatrix.push(row);

  return teaMatrix;
};

const TeaPage: React.FC = () => {
  const [teas, setTeas] = useState<Array<Tea>>([]);
  const { logout } = useAuthentication();
  const history = useHistory();
  const { getTeas } = useTea();

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  const showDetailsPage = (id: number) => {
    history.push(`/tabs/tea/details/${id}`);
  };

  useEffect(() => {
    const init = async () => {
      const teas = await getTeas();
      setTeas(teas);
    };
    init();
  }, [getTeas]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tea</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => handleLogout()}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tea</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonGrid className="tea-grid">
          {listToMatrix(teas).map((row, idx) => (
            <IonRow
              key={idx}
              className="ion-justify-content-center ion-align-items-stretch"
            >
              {row.map(tea => (
                <IonCol size="12" sizeMd="6" sizeXl="3" key={tea.id}>
                  <IonCard button onClick={() => showDetailsPage(tea.id)}>
                    <IonImg src={tea.image} />
                    <IonCardHeader>
                      <IonCardTitle>{tea.name}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>{tea.description}</IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          ))}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default TeaPage;
