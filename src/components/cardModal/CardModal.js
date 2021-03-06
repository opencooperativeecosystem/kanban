import React from 'react'
import style from './index.css'
import ModalTitle from './modalTitle'
import ModalMembers from './modalMembers'
import ModalActivities from './modalActivities'
import LogEvent from './logEvent'
import { compose, withState } from 'recompose'
import {graphql} from 'react-apollo'
import GetCommitment from '../../queries/getCommitment'

const CardModal = ({param, id, allPlanAgents, units, loading, data, error, close, modalDescription}) => {
  return (
    loading ? <h1>loading...</h1> : (
      error ? <p style={{ color: '#ddd' }}>API error</p> : (
    <section className={style.modal_content}>
      <ModalTitle close={close} id={data.id} note={data.note} />
      <div className={style.content_info}>
        <div className={style.content_module}>
          <div className={style.module_header}>
            <div className={style.header_labels}>
              <ModalMembers provider={data.provider} id={data.id} allPlanAgents={allPlanAgents} members={data.involvedAgents} />
              <div className={style.labels_due}>
                <div className={style.due}>
                  <span className={style.due_item}>Due {data.due}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={modalDescription ? style.content_description + ' ' + style.hidden : style.content_description}>
            <h5 className={style.modalDescription_title}>Commitment</h5>
            <h4>{data.action + ' ' + data.committedQuantity.numericValue + ' ' + data.committedQuantity.unit.name + ' of ' + data.resourceClassifiedAs.name}</h4>
          </div>
        </div>
        <LogEvent param={param} id={id} units={units} scopeId={data.scope.id} commitmentId={data.id} />
        <h5 className={style.modalDescription_title}>Contributions</h5>
        <ModalActivities param={param} units={units} scopeId={data.scope.id} commitmentId={data.id} id={id} />
      </div>
      {/* <div className={style.content_actions}>
        <div className={style.content_module}>
          <div className={style.content_action}>
            <div className={style.action_list}>
              <div className={style.list_archive}>
                
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </section>
    ))
  )
}

export default compose(
  graphql(GetCommitment, {
    options: ({id}) => ({ variables: { token: localStorage.getItem('token'), id: id}}),
    props: ({ ownProps, data: { viewer, loading, error, refetch } }) => ({
      loading,
      error,
      refetchData: refetch,  // :NOTE: call this in the component to force reload the data
      data: viewer ? viewer.commitment : null,
      units: viewer ? viewer.allUnits : null
    })
  }),
  withState('modalDescription', 'handleModalDescription', null)
)(CardModal)
