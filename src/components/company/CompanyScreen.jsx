import Header from "../layout/Header";
import AddCompany from "./Company";

export default function CompanyScreen() {
    return (
        <div className="space-y-8">
            <Header />
            <AddCompany />
        </div>
    );
}