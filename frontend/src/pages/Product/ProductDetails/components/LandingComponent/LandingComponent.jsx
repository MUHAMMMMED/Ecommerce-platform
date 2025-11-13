import './LandingComponent.css';
export default function LandingComponent({ components }) {
    return (
        <>

            {Array.isArray(components) &&
                components.sort((a, b) => a.index - b.index).map(component => (
                    <div className="component-wrapper " key={component.id}  >
                        <div dangerouslySetInnerHTML={{ __html: component.html_code }} />
                    </div>
                ))}

        </>
    );
}
