export const defaultState = {
    user: {
        id: undefined,
        email: undefined,
        username: undefined,
        name: undefined,
        surname: undefined
    },
    image: undefined,
    userList: []
}

const AppReducer = (state = defaultState, action) => {
    const draftState = JSON.parse(JSON.stringify(state));

    switch(action.type) {
        case 'SET_USER': {
            draftState.user = action.payload;

            return draftState;
        }
        case 'SET_IMAGE': {
            draftState.image = action.payload;

            return draftState;
        }
        case 'SET_USER_LIST': {
            draftState.userList = action.payload;

            return draftState;
        }
        default: {
            return state;
        }
    }
}

export default AppReducer;