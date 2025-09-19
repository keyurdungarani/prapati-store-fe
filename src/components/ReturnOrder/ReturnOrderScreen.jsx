import Header from "../layout/Header";
import ReturnOrderManager from "./ReturnOrder";

export default function ReturnOrderScreen() {
    return (
        <div className="space-y-8">
            <Header />
            <ReturnOrderManager />
        </div>
    );
}
