interface Props {
    cartCount: number;
}

const Header = ({ cartCount }: Props) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: "1px solid #eee",
            }}
        >
            <h2>🛒 QuickPick</h2>
            <div>
                Cart: <strong>{cartCount}</strong>
            </div>
        </div>
    );
};

export default Header;