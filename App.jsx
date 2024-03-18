import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [formValues, setFormValues] = useState({ id: '', username: '', password: '' });
  const [users, setUsers] = useState({});
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    getData();
  }, []);

  const addData = async () => {
    try {
      // Générer un ID unique pour chaque utilisateur
      const id = Date.now().toString();
      const newUser = { ...formValues, id };
      
      await AsyncStorage.setItem(`user_${id}`, JSON.stringify(newUser));
      setUsers({ ...users, [id]: newUser }); // Ajoute le nouvel utilisateur à la liste
    } catch (error) {
      console.error(error);
    }
  };

  const getData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const storedUsers = await AsyncStorage.multiGet(keys);
      
      const parsedUsers = storedUsers.reduce((acc, [key, value]) => {
        if (key.startsWith('user_')) {
          const user = JSON.parse(value);
          acc[user.id] = user;
        }
        return acc;
      }, {});
      
      setUsers(parsedUsers);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteData = async (id) => {
    try {
      await AsyncStorage.removeItem(`user_${id}`);
      const updatedUsers = { ...users };
      delete updatedUsers[id];
      setUsers(updatedUsers);
      
      if (loggedInUser && loggedInUser.id === id) {
        setLoggedInUser(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (key, value) => {
    setFormValues({ ...formValues, [key]: value });
  };

  const handleLogin = () => {
    const { username, password } = formValues;
    const user = Object.values(users).find(user => user.username === username && user.password === password);
    if (user) {
      setLoggedInUser(user);
    } else {
      alert('Utilisateur non trouvé. Veuillez vous inscrire.');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentification</Text>
      {!loggedInUser ? (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            value={formValues.username}
            onChangeText={(text) => handleInputChange('username', text)}
            placeholder="Nom d'utilisateur"
            required
          />
          <TextInput
            style={styles.input}
            value={formValues.password}
            onChangeText={(text) => handleInputChange('password', text)}
            placeholder="Mot de passe"
            required
          />
          <Button title="Se connecter" onPress={handleLogin} />
          <Button title="S'inscrire" onPress={addData} />
        </View>
      ) : (
        <View>
          <Text style={styles.loggedInText}>Bienvenue, {loggedInUser.username}!</Text>
          <Button title="Déconnexion" onPress={() => deleteData(loggedInUser.id)} />
        </View>
      )}
      <Text style={styles.listTitle}>Liste des Users :</Text>
      <FlatList
        data={Object.values(users)}
        renderItem={({ item }) => (
          <View>
            <Text>ID : {item.id}</Text>
            <Text>Username : {item.username}</Text>
            <Text>Password : {item.password}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: '80%',
    marginVertical: 10,
    paddingHorizontal: 10,
    borderColor: 'gray',
    borderWidth: 1,
  },
  loggedInText: {
    fontSize: 18,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
});
