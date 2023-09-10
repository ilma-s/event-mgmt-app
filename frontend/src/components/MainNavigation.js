import { Form, NavLink, useRouteLoaderData, useSearchParams,
} from 'react-router-dom';

import classes from './MainNavigation.module.css';

function MainNavigation() {
    const token = useRouteLoaderData('root');

    const [searchParams] = useSearchParams();

    const isLogin = searchParams.get('mode') === 'login';
    console.log(isLogin);

    return (
        <header className={classes.header}>
            <div>
                <nav>
                    <ul className={classes.list}>
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    isActive ? classes.active : undefined
                                }
                                end
                            >
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/events"
                                className={({ isActive }) =>
                                    isActive ? classes.active : undefined
                                }
                                end
                            >
                                Events
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            <div>
                <nav>
                    <ul className={classes.list}>
                        {!token && (
                            <li>
                                <NavLink
                                    to="/auth?mode=login"
                                    className={({ isActive }) =>
                                        isActive && isLogin ? classes.active : undefined
                                    }
                                    end
                                >
                                    Login
                                </NavLink>
                            </li>

                        )}

                        {token && (
                            <li>
                                <Form action="/logout" method="POST">
                                    <button>Logout</button>
                                </Form>
                            </li>
                        )}

                        {!token && (
                            <li>
                                <NavLink
                                    to="/auth?mode=signup"
                                    className={({ isActive }) =>
                                        isActive && !isLogin ? classes.active : undefined
                                    }
                                    end
                                >
                                    Create new user
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </nav>

            </div>
        </header>
    );
}

export default MainNavigation;
