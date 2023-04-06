import { useState } from 'react';
import './style.css';
import { ShaderTest } from './tests/shader';

function TestSelector(props: { tests: { title: string; view: React.ReactNode }[] }) {
    const [selected, setSelected] = useState<number | null>(null);
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
            }}
        >
            {selected === null &&
                props.tests.map((test, i) => (
                    <div
                        key={i}
                        onClick={() => setSelected(i)}
                        className={selected === i ? 'selected' : ''}
                        style={{
                            cursor: 'pointer',
                        }}
                    >
                        {test.title}
                    </div>
                ))}
            {selected !== null && props.tests[selected].view}
        </div>
    );
}

function App() {
    return (
        <TestSelector
            tests={[
                {
                    title: 'Shader',
                    view: <ShaderTest />,
                },
            ]}
        />
    );
}

export default App;
