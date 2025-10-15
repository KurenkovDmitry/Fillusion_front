export const DotBackground = () => {
    return (
        <div style={{
            height: 'inherit',
            backgroundImage: 'radial-gradient(black 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
        }} >
        </div>
    )
}