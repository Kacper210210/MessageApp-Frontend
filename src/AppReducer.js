export const defaultState = {
    user: {
        id: undefined,
        email: undefined,
        username: undefined,
        name: undefined,
        surname: undefined
    }
}

const AppReducer = (state = defaultState, action) => {
    const draftState = JSON.parse(JSON.stringify(state));

    switch(action.type) {
        case 'SET_USER': {
            draftState.user = action.payload;

            return draftState;
        }
        default: {
            return state;
        }
    }
}

export default AppReducer;