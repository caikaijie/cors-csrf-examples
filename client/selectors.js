import { createSelector } from 'reselect'

export const appSelector = state => state.app

export const clientlogsSelector = createSelector([ appSelector ], (app) => app.clientlogs )

export const serverlogsSelector = createSelector([ appSelector ], (app) => app.serverlogs )
