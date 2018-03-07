import {compose, withHandlers, withState} from 'recompose'
import Component from './modalActivities'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
// import {addFlagAction} from '../../../store/actions/flags'
import {connect} from 'react-redux'
import { actions as notifActions } from 'redux-notifications'

// const mapDispatchToProps = dispatch => ({
//   addFlag: (data) => {
//     dispatch(addFlagAction(data))
//   }
// })


const mapStateToProps = (state) => {
  return {
    state: state
  }
}

const mapDispatchToProps = (dispatch) => {
  const sendNotif = (id, message, kind, dismissAfter) => {
    notifActions.notifSend({
      message,
      kind,
      id: id,
      dismissAfter: 2000
    })(dispatch)
  }
  return {
    sendNotif
  }
}

const deleteEvent = gql`
mutation ($token: String!, $id: Int!) {
    deleteEconomicEvent(
      token: $token,
      id: $id
    ) {
      economicEvent {
        action
        start
      }
    }
}
`

export const queryEvents = gql`
query ($token: String!, $id: Int!) {
    viewer(token: $token) {
        commitment(id: $id) {
          id
          fulfilledBy {
            fulfilledBy {
              action
              requestDistribution
              start
              id
              note
              provider {
                name
                image
                id
              }
            }
            fulfilledQuantity {
              numericValue
              unit {
                name
              }
            }
          }
        }
    }
}
`

export default compose(
    graphql(deleteEvent, {
      options: (props) => ({
        refetchQueries: [
          {
            query: queryEvents,
            variables: {
              token: localStorage.getItem('token'),
              id: props.id
            }
          }
        ]
      }),
      props: ({mutate, ownProps: {id}}) => ({
        id, mutate
      })
    }),
    graphql(queryEvents, {
      options: ({id}) => ({ variables: { token: localStorage.getItem('token'), id: id}}),
      props: ({ ownProps, data: { viewer, loading, error, refetch } }) => ({
        loading,
        error,
        refetchData: refetch,  // :NOTE: call this in the component to force reload the data
        activities: viewer ? viewer.commitment.fulfilledBy : null
      })
    }),
    connect(mapStateToProps, mapDispatchToProps),
    withState('deleteEventModal', 'toggleDeleteEvent', false),
    withState('idEventToDelete', 'setId', ''),
    withHandlers({
      toggleDeleteEvent: (props) => (status, id) => {
        props.setId(id)
        props.toggleDeleteEvent(!status)
      },
      deleteEvent: ({sendNotif, toggleDeleteEvent, deleteEventModal, mutate, addFlag}) => (id) => {
        return (
          mutate({
            variables: {
              token: localStorage.getItem('token'),
              id: id
            }
          })
          .then((data) => {
            sendNotif(Math.random(), '✌️✌️✌️ Event deleted correctly', 'success', '5000')
            toggleDeleteEvent(!deleteEventModal)
          })
          .catch(e => sendNotif(Math.random(), e.message, 'danger', '5000'))
        )
      }
    })
  )(Component)
