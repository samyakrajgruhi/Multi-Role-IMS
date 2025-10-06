import {firestore} from '@/firebase';
import {collection, getDocs, query, where} from 'firebase/firestore';


export default async function loadLobbyData(lobbyName: string = 'All Lobbies', month?: number, year?: number){
    interface LobbyDataItem {
        srNo?: number;
        payDate?: string;
        lobby: string;
        sfaId: string;
        name?: string;
        cmsId?: string;
        receiver: string;
        amount: number;
        paymentMode:string;
        remarks:string;
    }
    interface UserData {
        full_name?: string;
        cms_id?: string;
    }
    

    try{
        const collectionRef = collection(firestore,'transactions');

        // Build query with filters
        const constraints = [];
        
        if (month !== undefined) {
            constraints.push(where('month', '==', month));
        }
        
        if (year !== undefined) {
            constraints.push(where('year', '==', year));
        }
        
        if (lobbyName !== 'All Lobbies') {
            constraints.push(where('lobby', '==', lobbyName));
        }

        let querySnapshot;
        if (constraints.length > 0) {
            const q = query(collectionRef, ...constraints);
            querySnapshot = await getDocs(q);
        } else {
            querySnapshot = await getDocs(collectionRef);
        }
        let srNo = 0;
        const lobbyData: LobbyDataItem[] = [];
        for(const docSnapshot of querySnapshot.docs){
            srNo++;
            const data = docSnapshot.data();
            let userData: UserData = {};
            if(data.sfaId){
                const userQuery = query(collection(firestore,'users'), where('sfa_id','==',data.sfaId));
                const userSnapshot = await getDocs(userQuery);
                if(!userSnapshot.empty){
                    userData = userSnapshot.docs[0].data() as UserData;
                }
            }
            lobbyData.push({
                srNo: srNo,
                payDate: data.dateString || data.date,
                lobby: data.lobby || lobbyName,
                sfaId: data.sfaId,
                name: userData.full_name || 'Unknown',
                cmsId: userData.cms_id || '-',
                receiver: data.receiver,
                amount: data.amount,
                paymentMode: data.mode,
                remarks: data.remarks || ''

            });
        }
        return lobbyData;

    }catch(error){
        console.error("Error loading lobby data :",error);
        return[];
    }


} 