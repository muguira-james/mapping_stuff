import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ShowMap from './ShowMap'

// 1
// bring in the right components for Apollo 2.x
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

// 2
// setup the communications link. This is going to point to a 
// graphql server instance.  
const httpLink = new HttpLink({ uri: 'http://localhost:4000' })
// const httpLink = new HttpLink({ uri:  "http://localhost:3000/playground"})

// 3
// use the http protocol and use an in memory cache
const client = new ApolloClient({
  link: httpLink, 
  cache: new InMemoryCache()
})

export default class App extends React.Component {
  
  // 
  // wrap the child componennt in Apollo "stuff"
  render() {
    return (
      <ApolloProvider client={client}>
        <ShowMap  
          mapType={'satellite'}
          
        />
      </ApolloProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
