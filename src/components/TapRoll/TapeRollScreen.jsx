import Header from "../layout/Header";
import TapeRollManager from "./TapeRollManager";

export default function TapeRollScreen() {
    return (
        <div className="space-y-8">
            <Header />
            <TapeRollManager />
        </div>
    );
}