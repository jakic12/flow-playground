import React, {useState} from "react";
import {navigate, useLocation} from "@reach/router"
import {Account} from "api/apollo/generated/graphql";
import {EntityType} from "providers/Project";
import {SidebarSection as Root} from "layout/SidebarSection";
import {SidebarHeader as Header} from "layout/SidebarHeader";
import {SidebarItems as Items} from "layout/SidebarItems";
import {SidebarItem as Item} from "layout/SidebarItem";
import {Stack} from "layout/Stack";
import {useProject} from "providers/Project/projectHooks";
import Avatar from "components/Avatar";
import styled from "@emotion/styled";
import {ExportButton} from "components/ExportButton";
import {getParams, isUUUID} from "../util/url";
import theme from "../theme";
import { VscChevronRight, VscAdd, VscChromeClose, VscOutput } from "react-icons/vsc";

function getDeployedContracts(account: Account): string {
  const contracts = account.deployedContracts.map(
    contract => contract.split(".").slice(-1)[0]
  );
  return contracts.join(", ");
}

export const AccountCard = styled.div`
  display: flex;
  align-items: flex-end;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  width: 100%;
`;

const Dropdown = styled.div`
`;

type ItemProps = {
  active?: boolean;
  children?: React.ReactNode;
};
const DropdownItem = styled.div<ItemProps>`
  padding:1em;
  padding-left:1rem;
  color:#6a6a6a;

  display:flex;
  flex-direction:row;
  align-items: center;
  //justify-content: space-between;
  

  background:white;
  &:hover{
    cursor:pointer;
  }
  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.75);
  }

  ${p =>  p.active && `background: rgba(255, 255, 255, 0.75);

  &:after {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 6px;
    border-radius: 0 3px 3px 0;
    background: ${theme.colors.primary};
  }`};
  position: relative;
`

const IconArrowContainer = styled.div`
  align-self:center;
  &:hover{
    cursor:pointer;
  }

  padding:0 0.3em 0 0.3em;
`;

const ArrowIcon = styled(VscChevronRight)<{ open?: boolean;}>`
  transform: ${p => p.open ? `rotate(90deg)` : `rotate(0deg)`};
  transition: transform 0.2s;
`;

const changeAtIndexAndCopyArr = (a: Array<any>, index: number, value: any) => {
  const b = JSON.parse(JSON.stringify(a));
  b[index] = value;
  return b;
}


const AccountList: React.FC = () => {
  const {
    project,
    active,
  } = useProject();
  const [listsOpen, setListsOpen] = useState(new Array(5).fill(false));
  const accountSelected = active.type === EntityType.Account

  const location = useLocation();
  const params = getParams(location.search)
  const projectPath = isUUUID(project.id) ? project.id : "local"

  return (
    <Root>
      <Header>Accounts</Header>
      <Items>
        {project.accounts.map((account: Account, i: number) => {
          const { id } = account
          const isActive = accountSelected && params.id === id
          const accountAddress = `0x${account.address.slice(-2)}`
          const contractName = getDeployedContracts(account)
          const title = contractName
            ? `${contractName} is deployed to this account`
            : `This account doesn't have any contracts`
          const typeName = account.__typename
          return (
            <>
              <Item
                key={id}
                title={title}
                active={isActive && false}
                //onClick={() => navigate(`/${projectPath}?type=account&id=${id}`)}
                onClick={() => setListsOpen(changeAtIndexAndCopyArr(listsOpen, i, !listsOpen[i]))}
              >
                <AccountCard onClick={() => setListsOpen(changeAtIndexAndCopyArr(listsOpen, i, !listsOpen[i]))}>
                  <IconArrowContainer><ArrowIcon open={listsOpen[i]} size={`1em`} /></IconArrowContainer>
                  <Avatar seed={project.seed} index={i} />
                  <Stack>
                    <strong>{accountAddress}</strong>
                    <small>{contractName || '--'}</small>
                  </Stack>

                  <IconArrowContainer><VscAdd size={`.8em`} /></IconArrowContainer>
                  {isActive && <ExportButton id={account.id} typeName={typeName}/>}
                  
                </AccountCard>
              </Item>
              {listsOpen[i] && <Dropdown>
                {new Array(i + 1).fill(1).map((_, contract_i) => 
                  <DropdownItem active={i==0 && contract_i == 0}><IconArrowContainer style={{paddingRight:`1rem`}}><VscOutput /></IconArrowContainer><div>contract {contract_i}</div><IconArrowContainer style={{marginLeft:`auto`}}><VscChromeClose color={`#f44336`} size={`.8em`} /></IconArrowContainer></DropdownItem>
                )}
              </Dropdown>}
            </>
          );
        })}
      </Items>
    </Root>
  );
};

export default AccountList;
