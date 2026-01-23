import "../styles/app.css";

interface Props {
    categories: string[];
    active: string;
    onChange: (category: string) => void;
}

export default function CategoryBar({ categories, active, onChange }: Props) {
    return (
        <div className="category-bar">
            {["All", ...categories].map((cat) => (
                <button
                    key={cat}
                    className={`category-pill ${active === cat ? "active" : ""}`}
                    onClick={() => onChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}