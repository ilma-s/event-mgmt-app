import { json, redirect } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const AuthenticationPage = () => {
    return <AuthForm />;
};

export default AuthenticationPage;

export const action = async ({ request }) => {
    const searchParams = new URL(request.url).searchParams;

    const mode = searchParams.get('mode') || 'login';

    if (mode !== 'login' && mode !== 'signup') {
        throw json({ message: 'unsupported mode' }, { status: 422 });
    }

    const data = await request.formData();
    let authData = {
        password: data.get('password'),
    }

    if (mode === 'login') {
        authData = { ...authData, identifier: data.get('identifier')}
    } else {
        authData = { ...authData, email: data.get('email'), username: data.get('username')};
    }

    const response = await fetch('http://localhost:8080/' + mode, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
    });

    if (response.status === 422 || response.status === 401) {
        return response;
    }

    if (!response.ok) {
        throw json({ message: 'could not authenticate user' }, { status: 500 });
    }

    const resData = await response.json();
    const token = resData.token;

    localStorage.setItem('token', token);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    localStorage.setItem('expiration', expiration.toISOString());

    if (mode === 'signup') {
        localStorage.setItem('identifier', authData.email);
    } else {
        localStorage.setItem('identifier', authData.identifier);
    }


    return redirect('/');
};
