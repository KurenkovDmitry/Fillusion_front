interface NonModalGenerateProps {
    open?: boolean;
    setOpen?: (open: boolean) => void;
}

export const NonModalGenerate = (props: NonModalGenerateProps) => {
    return (
        <div style={{ width: '100dvw', minHeight: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F3F3F5' }}>
            <header style={{ position: 'absolute', top: '0px', width: '100dvw', backgroundColor: '#becaffff' }}>
                <h2
                    style={{
                        margin: '16px',
                        color: 'white',
                        background: 'linear-gradient(90deg, #4f8cff 0%, #7f53ff 50%, #ff6a88 100%)',
                        width: 'fit-content',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 800,
                        fontSize: '2rem',
                        letterSpacing: '2px'
                    }}
                >
                    Fillusion
                </h2>
            </header>
            <table style={{
                borderCollapse: 'collapse',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                overflow: 'hidden',
                minWidth: '480px'
            }}>
                <thead>
                    <tr style={{ background: '#4f8cff', color: 'white' }}>
                        <th style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: '15px', border: 'none' }}>ID</th>
                        <th style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: '15px', border: 'none' }}>Имя</th>
                        <th style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: '15px', border: 'none' }}>Email</th>
                        <th style={{ padding: '12px 24px', fontWeight: 'bold', fontSize: '15px', border: 'none' }}>Город</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={4} style={{
                            padding: '40px 24px',
                            textAlign: 'center',
                            color: '#888',
                            fontSize: '16px',
                            borderBottom: '1px solid #eee',
                            background: '#F8F8FA',
                            cursor: 'pointer'
                        }} onClick={() => props.setOpen ? props.setOpen(true) : null}>
                            Нажмите, чтобы сгенерировать данные
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}