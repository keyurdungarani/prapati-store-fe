import Header from "../layout/Header";
import KraftMailerManager from "./KraftMailerManager";

export default function KraftMailerScreen() {
    return (
        <div className="space-y-8">
            <Header />
            <KraftMailerManager />
        </div>
    );
}