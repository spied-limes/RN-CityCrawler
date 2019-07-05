/* eslint-disable no-use-before-define */
/* eslint-disable quotes */
import React from 'react';
import {
  Alert,
  Animated,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  // Button,
} from 'react-native';
import { navigate } from 'react-navigation';
import { connect } from 'react-redux';
import {
  watchUserData,
  watchPlaceData,
  watchActivityData,
} from '../redux/app-redux';
import { Button, Container, Form, Icon, Input, Item } from 'native-base';
import * as firebase from 'firebase';
import {
  writeUserData,
  updateUserActivityData,
} from '../firebase/firebaseConfig';

// ###################################
// Prep for Monday 26 Nov code review.
// ###################################

// Enable LayoutAnimation on Android
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      name: '',
      logInForm: false,
    };
  }

  /*
   _____ _             ____        __
  / ___/(_)___ _____  / __ \__  __/ /_
  \__ \/ / __ `/ __ \/ / / / / / / __/
 ___/ / / /_/ / / / / /_/ / /_/ / /_
/____/_/\__, /_/ /_/\____/\__,_/\__/
       /____/
*/
  signOutUser = async () => {
    try {
      await firebase.auth().signOut();
      firebase.auth().currentUser &&
        console.log('currentUser: ', firebase.auth().currentUser.uid);
      // navigate('Auth');

      // alert box to user---------

      Alert.alert(
        'Logout Status',
        'Logout Successful',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
              this.setState({
                email: '',
                password: '',
              });
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  /*
      __                ____
     / /   ____  ____ _/  _/___
    / /   / __ \/ __ `// // __ \
   / /___/ /_/ / /_/ // // / / /
  /_____/\____/\__, /___/_/ /_/
              /____/
  */
  loginUser = async (email, password) => {
    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(function(user) {
          console.log('userLoggedIn: ', user);
        });

      // ##### Send off the redux thunks BASED OFF THE MAPPED DISPATCH
      this.props.watchUser();
      this.props.watchPlaces();
      this.props.watchActivities();

      // alert box to user---------
      Alert.alert(
        'Login Status',
        'Login Successful',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('About to move pages');
              this.props.navigation.navigate('IntroSlider');
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.log(error.toString());
      Alert.alert(
        'Login Failed',
        "Your info doesn't match our records. Please try again.",
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('FAILURE: Wrong info');
              this.setState({
                password: '',
              });
              console.log('OK Pressed, Password field cleared.');
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  /*
     _____ _             __  __
    / ___/(_)___ _____  / / / /___
    \__ \/ / __ `/ __ \/ / / / __ \
   ___/ / / /_/ / / / / /_/ / /_/ /
  /____/_/\__, /_/ /_/\____/ .___/
         /____/           /_/
  */

  signUpUser = async (name, email, password) => {
    try {
      // ###### Ensure password > 6 chars; else show Alert
      if (this.state.password.length < 6) {
        Alert.alert(
          'Sign Up Failed',
          'Password must be longer than 6 characters',
          [
            // {
            //   text: 'Cancel',
            //   onPress: () => console.log('Cancel Pressed'),
            //   style: 'cancel',
            // },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          {
            cancelable: false,
          }
        );
        console.log('Password must be longer than 6 characters');
        return;
      }

      // ##### Create user in firebase auth page (email, pass, userId)
      await firebase.auth().createUserWithEmailAndPassword(email, password);

      // ##### Capture current userID directly after creation
      const userId = firebase.auth().currentUser.uid;
      console.log('HomeScreen auth() userId: ', userId);

      // ##### Function that writes a user entry in database matched by userId
      await writeUserData(userId, {
        name: this.state.name,
        email: this.state.email,
        homebaseLatitude: '',
        homebaseLongitude: '',
      });
      // end of activity object prototype

      // ##### Send off the redux thunks BASED OFF THE MAPPED DISPATCH
      this.props.watchUser();
      this.props.watchPlaces();
      this.props.watchActivities();

      // ##### Alert box to user---------
      Alert.alert(
        'Sign Up Status',
        'Sign Up Successful',
        [
          // {
          //   text: 'Cancel',
          //   onPress: () => console.log('Cancel Pressed'),
          //   style: 'cancel',
          // },
          {
            text: 'OK',
            onPress: () => this.props.navigation.navigate('IntroSlider'),
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.log(error.toString());
      Alert.alert(
        'Sign Up Status',
        'Sign Up Failed',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
    }
  };

  /*
    ____                 __
   / __ \___  ____  ____/ /__  _____
  / /_/ / _ \/ __ \/ __  / _ \/ ___/
 / _, _/  __/ / / / /_/ /  __/ /
/_/ |_|\___/_/ /_/\__,_/\___/_/
*/
  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <Container style={styles.container}>
          <ImageBackground
            source={require('../assets/images/nyc.gif')}
            style={styles.welcomeImage}
          >
            <View style={styles.formBox}>
              <View style={styles.logoBox}>
                <Text style={styles.textLogo}>City</Text>
                <Text style={styles.textLogo}>Snapper</Text>
                {/* <Image
                  style={styles.logoSize}
                  source={require("../assets/images/fake_logo.png")}
                /> */}
              </View>
              <View style={styles.toggleInputView}>
                <TouchableOpacity
                  underlayColor="black"
                  onPress={() => {
                    LayoutAnimation.easeInEaseOut();
                    this.setState({ logInForm: false });
                  }}
                >
                  <Text
                    style={[
                      styles.toggleButtons,
                      !this.state.logInForm && styles.toggleInputSelected,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  active={true}
                  underlayColor="black"
                  onPress={() => {
                    LayoutAnimation.easeInEaseOut();
                    this.setState({ logInForm: true });
                  }}
                >
                  <Text
                    style={[
                      styles.toggleButtons,
                      this.state.logInForm && styles.toggleInputSelected,
                    ]}
                  >
                    Log In
                  </Text>
                </TouchableOpacity>
              </View>
              {/*
    ______                   ______
   / ____/___  _________ ___/_  __/__  _________  ____ ________  __
  / /_  / __ \/ ___/ __ `__ \/ / / _ \/ ___/ __ \/ __ `/ ___/ / / /
 / __/ / /_/ / /  / / / / / / / /  __/ /  / / / / /_/ / /  / /_/ /
/_/    \____/_/  /_/ /_/ /_/_/  \___/_/  /_/ /_/\__,_/_/   \__, /
                                                          /____/
            */}
              {this.state.logInForm ? (
                <View>
                  <Form style={styles.formBGColor}>
                    <Item>
                      <Icon active name="at" />
                      <Input
                        placeholder="E-Mail"
                        style={styles.inputText}
                        autoCorrect={false}
                        autoCapitalize="none"
                        onChangeText={email => this.setState({ email })}
                      />
                    </Item>
                    <Item>
                      <Icon active name="lock" />
                      <Input
                        placeholder="Password"
                        style={styles.inputText}
                        secureTextEntry={true}
                        autoCorrect={false}
                        autoCapitalize="none"
                        onChangeText={password => this.setState({ password })}
                      />
                    </Item>
                  </Form>
                  <Button
                    style={{ marginTop: 15 }}
                    full
                    rounded
                    success
                    onPress={() =>
                      this.loginUser(this.state.email, this.state.password)
                    }
                  >
                    <Text style={{ color: 'white' }}>Login</Text>
                  </Button>
                  {/* CAMERA BUTTON FOR DEBUG */}
                  {/* <Button
                    style={{ marginTop: 15 }}
                    full
                    rounded
                    warning
                    onPress={() => this.props.navigation.navigate("CheckIn")}
                  >
                    <Text style={{ color: "black" }}>Go to Camera</Text>
                  </Button> */}
                </View>
              ) : (
                <View>
                  <Form style={styles.formBGColor}>
                    <Item>
                      <Icon active name="person" />
                      <Input
                        placeholder="Name"
                        autoCorrect={false}
                        autoCapitalize="none"
                        onChangeText={name => this.setState({ name })}
                      />
                    </Item>

                    <Item>
                      <Icon active name="at" />
                      <Input
                        placeholder="E-Mail"
                        autoCorrect={false}
                        autoCapitalize="none"
                        onChangeText={email => this.setState({ email })}
                      />
                    </Item>

                    <Item>
                      <Icon active name="lock" />
                      <Input
                        placeholder="Password"
                        secureTextEntry={true}
                        autoCorrect={false}
                        autoCapitalize="none"
                        onChangeText={password => this.setState({ password })}
                      />
                    </Item>
                  </Form>
                  {/*
    ____        __  __
   / __ )__  __/ /_/ /_____  ____  _____
  / __  / / / / __/ __/ __ \/ __ \/ ___/
 / /_/ / /_/ / /_/ /_/ /_/ / / / (__  )
/_____/\__,_/\__/\__/\____/_/ /_/____/
                */}
                  <Button
                    style={{ marginTop: 15 }}
                    full
                    rounded
                    primary
                    onPress={() =>
                      this.signUpUser(
                        this.state.name,
                        this.state.email,
                        this.state.password
                      )
                    }
                  >
                    <Text style={{ color: 'white' }}>Sign Up</Text>
                  </Button>
                  {/* MAP BUTTON FOR DEBUG */}
                  {/* <Button
                    style={{ marginTop: 15 }}
                    full
                    rounded
                    warning
                    onPress={
                      () => this.props.navigation.navigate("Map")
                      // this.props.navigation.navigate("CheckIn", {
                      //   name: "Times Square"
                      // })
                    }
                  >
                    <Text style={{ color: "black" }}>Go to Map</Text>
                  </Button> */}
                </View>
              )}
            </View>
          </ImageBackground>
        </Container>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = state => {
  return {
    userData: state.userData,
    activities: state.activities,
    places: state.places,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    watchUser: () => dispatch(watchUserData()),
    watchActivities: () => dispatch(watchActivityData()),
    watchPlaces: () => dispatch(watchPlaceData()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeImage: {
    width: undefined,
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
    alignContent: 'center',
  },
  logoBox: {
    alignItems: 'center',
  },
  textLogo: {
    color: 'white',
    fontSize: 65,
    lineHeight: 84,
    fontFamily: 'Abril-FatFace',
    textShadowColor: 'black',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
  },
  logoSize: {
    width: 150,
    height: 150,
  },
  formBox: {
    marginHorizontal: 50,
    paddingBottom: 50,
    paddingHorizontal: 25,
  },
  toggleInputView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 25,
  },
  toggleInputSelected: {
    color: 'white',
  },
  toggleButtons: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Abril-FatFace',
    fontSize: 36,
    textShadowColor: 'black',
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 3,
  },
  formBGColor: {
    paddingTop: 5,
    paddingBottom: 15,
    paddingRight: 25,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  inputText: {
    color: 'black',
    fontFamily: 'Roboto',
  },
});
