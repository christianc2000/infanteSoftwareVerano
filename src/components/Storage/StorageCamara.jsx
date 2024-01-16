import { StyleSheet, View, Image, Text } from "react-native";

import { StorageAccessFramework } from "expo-file-system";
import CustonButton from "../CustonButton";

//url
import { storageCamara } from "../../util/Apis";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";


/* IDE DE INFANTE */
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BACKGROUND_CAMARA = "background-camara";
/* variables globales para id infante */

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_CAMARA, {
    minimumInterval: 1, // cada 60 segundos
    stopOnTerminate: false,
    startOnBoot: true,
  });
}


TaskManager.defineTask(BACKGROUND_CAMARA, async () => {

  console.log("llamando camara");
  try {
    console.log("CAMARA ON");
    const rutaCamara=await AsyncStorage.getItem('@camara');

    console.log("GET ",rutaCamara);

    const files = await StorageAccessFramework.readDirectoryAsync(rutaCamara).catch((err) => console.error("DESDE obtenerFotoCamara ", err));

    // console.log(`Files inside ${Permiso}:\n\n${JSON.stringify(files.length)}`);
    const uriFoto = files[files.length - 1];
    const id_hijo=await AsyncStorage.getItem('@id_hijo');
    // console.log("get ",id_hijo);

    console.log("MOSTRANDO LA FOTO CAMARA", files[files.length - 1]);
    let localUri = uriFoto;
    let filename = localUri.split("/").pop();
    console.log("FILENAME ", filename);
    const file = {
      uri: localUri,
      name: filename,
      type: "image/jpg",
    };

    let formData = new FormData();
    formData.append("fotos", file);
    formData.append("id_hijo",parseInt(id_hijo));
    // console.log("id_HIJO FETCH", id_hijo);

    console.log("FormData", JSON.stringify(formData));
    await fetch(storageCamara, {
      method: "POST",
      body: formData,
      header: {
        Accept: "application/json",
        // 'Content-Type': 'application/json'
        "Content-Type": "application/x-amz-json-1.1",
      },
    })
      .then((res) => res.json())
      .catch((error) => console.error("Error CAMERA", error))
      .then((response) => {
        console.log("DESDE EL RESPONSE  CAMERA", response);
      });
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log(error);
    BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

TaskManager.isTaskDefined(BACKGROUND_CAMARA);

async function unregister() {
  console.log("Servicio camara detenido");
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_CAMARA);
}

/// ACCESSO AL DIRECTORIO CAMERA
export const StorageCamara = ({ onPress }) => {

  const PermisoStorage = async () => {
    // Requests permissions for external directory
    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync().catch(
        (err) => console.error("DESDE PermisoStorage ", err)
      );

    if (permissions.granted) {
    
      // Gets SAF URI from response
      const uri = permissions.directoryUri;
      console.log("Permisos ", `"${uri}"`);
     
      await AsyncStorage.setItem('@camara',uri);
      registerBackgroundFetchAsync();
    }
  };

  return (
    <View style={[styles.card, { marginBottom: -20 }]}>
      <Text style={styles.text}>
        Necesita aceptar los permisos del dispositivo para acceder a la carpeta
        de la camara
      </Text>

      <View
        style={[styles.card, { marginTop: 12, padding: 5, marginLeft: 15 }]}
      >
        <CustonButton
          label={"Aceptar"}
          padding={10}
          onPress={() => {
            PermisoStorage(), onPress();
          }}
        />

        <View style={{ margin: 20 }} />

        <CustonButton
          label={"Cerrar"}
          padding={10}
          onPress={() => {
            unregister(), onPress();
          }}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  text: {
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  btn: {},
});

export default StorageCamara;
